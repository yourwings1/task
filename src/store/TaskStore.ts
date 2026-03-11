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

export interface Task {
	id: string;
	title: string;
	assignee: string;
	project: string;
	date: string;
	tags: string[];
	description: string;
	status: ColumnType;
	order: number;
}

type TaskDoc = {
	title: string;
	assignee: string;
	project: string;
	date: string;
	tags: string[];
	description: string;
	status: ColumnType;
	order: number;
	createdAt?: Timestamp;
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
					project: data.project,
					date: data.date,
					tags: data.tags ?? [],
					description: data.description ?? "",
					status: data.status,
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

		await addDoc(tasksRef, {
			title,
			assignee: "Не назначен",
			project,
			date: new Date().toLocaleDateString(),
			tags: ["Приоритет 1"],
			description: "",
			status: column,
			order: nextOrder,
			createdAt: Timestamp.now(),
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
				});
			});
		}

		await batch.commit();
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

		await updateDoc(
			doc(db, "users", user.uid, "projects", projectId, "tasks", taskId),
			updates,
		);
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
