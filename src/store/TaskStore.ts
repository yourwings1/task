import { makeAutoObservable, runInAction } from "mobx";
import {
	addDoc,
	collection,
	doc,
	onSnapshot,
	orderBy,
	query,
	Timestamp,
	updateDoc,
	deleteDoc,
	writeBatch,
} from "firebase/firestore";
import { auth, db } from "../firebase/firebase";
import projectStore from "./ProjectStore";

export type ColumnType = "open" | "inProgress" | "review" | "done";

export interface TaskAttachment {
	id: string;
	name: string;
	size: number;
	type: string;
	uploadedAt: string;
	uploadedBy: string;
	path: string;
}

export interface Task {
	id: string;
	title: string;
	assignee: string;
	assigneeId: string;
	creator: string;
	project: string;
	date: string;
	createdAtIso: string;
	tags: string[];
	attachments: TaskAttachment[];
	description: string;
	status: ColumnType;
	priority: string;
	startDate: string;
	dueDate: string;
	completedAt: string;
	timeEstimate: string;
	timeSpent: string;
	order: number;
}

type TaskDoc = {
	title: string;
	assignee: string;
	assigneeId?: string;
	creator?: string;
	project: string;
	date: string;
	createdAtIso?: string;
	tags: string[];
	attachments?: TaskAttachment[];
	description: string;
	status: ColumnType;
	priority?: string;
	startDate?: string;
	dueDate?: string;
	completedAt?: string;
	timeEstimate?: string;
	timeSpent?: string;
	order: number;
	createdAt?: Timestamp;
	updatedAt?: Timestamp;
};

const notAssigned = "Не назначен";
const mediumPriority = "Средний";

const createLocalId = () =>
	`${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const getDateMs = (value?: string) => {
	if (!value) return Number.NaN;

	const parsed = Date.parse(value);
	if (!Number.isNaN(parsed)) return parsed;

	const match = value.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
	if (!match) return Number.NaN;

	const [, day, month, year] = match;
	return new Date(Number(year), Number(month) - 1, Number(day)).getTime();
};

const getTaskStartDate = (task: Task) =>
	task.startDate || task.createdAtIso || task.date;

export const formatSpentTime = (start?: string, finish?: string) => {
	const startMs = getDateMs(start);
	const finishMs = getDateMs(finish);

	if (Number.isNaN(startMs) || Number.isNaN(finishMs) || finishMs <= startMs) {
		return "";
	}

	const minutes = Math.floor((finishMs - startMs) / 60000);
	if (minutes < 1) return "меньше минуты";

	const days = Math.floor(minutes / 1440);
	const hours = Math.floor((minutes % 1440) / 60);
	const restMinutes = minutes % 60;

	return [
		days ? `${days} д` : "",
		hours ? `${hours} ч` : "",
		restMinutes ? `${restMinutes} мин` : "",
	]
		.filter(Boolean)
		.join(" ");
};

const defaultColumns = (): Record<ColumnType, Task[]> => ({
	open: [],
	inProgress: [],
	review: [],
	done: [],
});

class TaskStore {
	newTaskTitle = "";
	data: Record<string, Record<ColumnType, Task[]>> = {};

	private unsubscribeTasks: null | (() => void) = null;

	constructor() {
		makeAutoObservable(this);
	}

	setNewTaskTitle(value: string) {
		this.newTaskTitle = value;
	}

	clearAll() {
		this.data = {};
		this.newTaskTitle = "";

		if (this.unsubscribeTasks) {
			this.unsubscribeTasks();
			this.unsubscribeTasks = null;
		}
	}

	clearCurrentProject() {
		if (this.unsubscribeTasks) {
			this.unsubscribeTasks();
			this.unsubscribeTasks = null;
		}
	}

	initProject(name: string) {
		if (!this.data[name]) {
			this.data[name] = defaultColumns();
		}
	}

	get columns(): Record<ColumnType, Task[]> {
		const project = projectStore.selectedProject;
		if (!project) return defaultColumns();

		this.initProject(project);
		return this.data[project];
	}

	subscribeToProject(projectName: string) {
		const user = auth.currentUser;
		const projectId = projectStore.getProjectIdByName(projectName);

		if (!user || !projectId) return;

		this.initProject(projectName);

		if (this.unsubscribeTasks) {
			this.unsubscribeTasks();
			this.unsubscribeTasks = null;
		}

		const tasksRef = collection(
			db,
			"users",
			user.uid,
			"projects",
			projectId,
			"tasks",
		);

		const q = query(tasksRef, orderBy("order", "asc"));

		this.unsubscribeTasks = onSnapshot(q, (snapshot) => {
			const columns = defaultColumns();

			snapshot.forEach((docSnap) => {
				const data = docSnap.data() as TaskDoc;

				const task: Task = {
					id: docSnap.id,
					title: data.title,
					assignee: data.assignee,
					assigneeId: data.assigneeId ?? data.assignee,
					creator: data.creator ?? notAssigned,
					project: data.project,
					date: data.date,
					createdAtIso: data.createdAtIso ?? "",
					tags: data.tags ?? [],
					attachments: data.attachments ?? [],
					description: data.description ?? "",
					status: data.status,
					priority: data.priority ?? mediumPriority,
					startDate: data.startDate ?? "",
					dueDate: data.dueDate ?? data.date ?? "",
					completedAt: data.completedAt ?? "",
					timeEstimate: data.timeEstimate ?? "",
					timeSpent: data.timeSpent ?? "",
					order: data.order ?? 0,
				};

				columns[task.status].push(task);
			});

			runInAction(() => {
				this.data[projectName] = columns;
			});
		});
	}

	async addTask(column: ColumnType) {
		const title = this.newTaskTitle.trim();
		const user = auth.currentUser;
		const project = projectStore.selectedProject;
		const projectId = projectStore.getProjectIdByName(project);

		if (!title || !user || !project || !projectId) return;

		this.initProject(project);

		const nextOrder = this.data[project][column].length;

		const tasksRef = collection(
			db,
			"users",
			user.uid,
			"projects",
			projectId,
			"tasks",
		);

		const now = new Date();

		await addDoc(tasksRef, {
			title,
			assignee: notAssigned,
			assigneeId: "",
			creator: user.displayName || user.email || user.uid,
			project,
			date: now.toLocaleDateString(),
			createdAtIso: now.toISOString(),
			tags: [],
			attachments: [],
			description: "",
			status: column,
			priority: mediumPriority,
			startDate: now.toISOString(),
			dueDate: "",
			completedAt: "",
			timeEstimate: "",
			timeSpent: "",
			order: nextOrder,
			createdAt: Timestamp.now(),
			updatedAt: Timestamp.now(),
		});

		runInAction(() => {
			this.newTaskTitle = "";
		});
	}

	async moveTask(
		fromColumn: ColumnType,
		toColumn: ColumnType,
		fromIndex: number,
		toIndex: number,
	) {
		const user = auth.currentUser;
		const project = projectStore.selectedProject;
		const projectId = projectStore.getProjectIdByName(project);

		if (!user || !project || !projectId) return;

		this.initProject(project);

		const sourceList = [...this.data[project][fromColumn]];
		const targetList =
			fromColumn === toColumn
				? sourceList
				: [...this.data[project][toColumn]];

		const task = sourceList[fromIndex];
		if (!task) return;

		sourceList.splice(fromIndex, 1);

		const movedTask = { ...task, status: toColumn };

		if (fromColumn === toColumn) {
			sourceList.splice(toIndex, 0, movedTask);
		} else {
			targetList.splice(toIndex, 0, movedTask);
		}

		const batch = writeBatch(db);

		if (fromColumn === toColumn) {
			sourceList.forEach((item, index) => {
				const taskRef = doc(
					db,
					"users",
					user.uid,
					"projects",
					projectId,
					"tasks",
					item.id,
				);

				batch.update(taskRef, {
					order: index,
					status: item.status,
					updatedAt: Timestamp.now(),
				});
			});
		} else {
			sourceList.forEach((item, index) => {
				const taskRef = doc(
					db,
					"users",
					user.uid,
					"projects",
					projectId,
					"tasks",
					item.id,
				);

				batch.update(taskRef, {
					order: index,
					status: item.status,
					updatedAt: Timestamp.now(),
				});
			});

			targetList.forEach((item, index) => {
				const taskRef = doc(
					db,
					"users",
					user.uid,
					"projects",
					projectId,
					"tasks",
					item.id,
				);

				batch.update(taskRef, {
					order: index,
					status: item.status,
					...(item.id === task.id
						? this.getClosingUpdates(task, toColumn)
						: {}),
					updatedAt: Timestamp.now(),
				});
			});
		}

		await batch.commit();
	}

	private getClosingUpdates(task: Task, nextStatus: ColumnType) {
		if (nextStatus !== "done") return {};

		const completedAt = task.completedAt || new Date().toISOString();
		const timeSpent = task.timeSpent || formatSpentTime(
			getTaskStartDate(task),
			completedAt,
		);

		return {
			completedAt,
			timeSpent,
		};
	}

	async moveTaskToColumn(task: Task, newColumn: ColumnType) {
		const user = auth.currentUser;
		const project = projectStore.selectedProject;
		const projectId = projectStore.getProjectIdByName(project);

		if (!user || !project || !projectId) return;

		const newOrder = this.data[project][newColumn].length;

		await updateDoc(
			doc(db, "users", user.uid, "projects", projectId, "tasks", task.id),
			{
				status: newColumn,
				order: newOrder,
				...this.getClosingUpdates(task, newColumn),
				updatedAt: Timestamp.now(),
			},
		);
	}

	findTaskById(id: string): Task | null {
		const project = projectStore.selectedProject;
		if (!project) return null;

		this.initProject(project);

		for (const column of Object.values(this.data[project])) {
			const found = column.find((t) => t.id === id);
			if (found) return found;
		}

		return null;
	}

	async updateTask(taskId: string, updates: Partial<Omit<Task, "id">>) {
		const user = auth.currentUser;
		const project = projectStore.selectedProject;
		const projectId = projectStore.getProjectIdByName(project);

		if (!user || !project || !projectId) return;

		const currentTask = this.findTaskById(taskId);
		const nextStatus = updates.status ?? currentTask?.status;
		const closingUpdates =
			currentTask && nextStatus
				? this.getClosingUpdates(currentTask, nextStatus)
				: {};

		await updateDoc(
			doc(db, "users", user.uid, "projects", projectId, "tasks", taskId),
			{
				...updates,
				...closingUpdates,
				updatedAt: Timestamp.now(),
			},
		);
	}

	async addAttachment(taskId: string, file: File) {
		const user = auth.currentUser;
		const task = this.findTaskById(taskId);

		if (!user || !task) return;

		const attachment: TaskAttachment = {
			id: createLocalId(),
			name: file.name,
			size: file.size,
			type: file.type || "application/octet-stream",
			uploadedAt: new Date().toISOString(),
			uploadedBy: user.uid,
			path: "",
		};

		await this.updateTask(taskId, {
			attachments: [...task.attachments, attachment],
		});
	}

	async removeAttachment(taskId: string, attachmentId: string) {
		const task = this.findTaskById(taskId);

		if (!task) return;

		await this.updateTask(taskId, {
			attachments: task.attachments.filter(
				(attachment) => attachment.id !== attachmentId,
			),
		});
	}

	async removeTask(taskId: string) {
		const user = auth.currentUser;
		const project = projectStore.selectedProject;
		const projectId = projectStore.getProjectIdByName(project);

		if (!user || !project || !projectId) return;

		await deleteDoc(
			doc(db, "users", user.uid, "projects", projectId, "tasks", taskId),
		);
	}

	getColumnTitle(key: ColumnType): string {
		switch (key) {
			case "open":
				return "Открыто";
			case "inProgress":
				return "В работе";
			case "review":
				return "На проверке";
			case "done":
				return "Закрыто";
			default:
				return "Неизвестно";
		}
	}
}

const taskStore = new TaskStore();
export default taskStore;
