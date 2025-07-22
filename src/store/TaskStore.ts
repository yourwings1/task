import { makeAutoObservable } from "mobx";
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
}

const defaultColumns = (): Record<ColumnType, Task[]> => ({
	open: [],
	inProgress: [],
	review: [],
	done: [],
});

class TaskStore {
	newTaskTitle = "";
	data: Record<string, Record<ColumnType, Task[]>> = {};

	constructor() {
		makeAutoObservable(this);
	}

	// Инициализация проекта при первом доступе
	initProject(name: string) {
		if (!this.data[name]) {
			this.data[name] = defaultColumns();
		}
	}

	// Текущие колонки текущего проекта
	get columns(): Record<ColumnType, Task[]> {
		const project = projectStore.selectedProject;
		if (!project) return defaultColumns();

		this.initProject(project); // на всякий случай
		return this.data[project];
	}

	addTask(column: ColumnType) {
		const title = this.newTaskTitle.trim();
		const project = projectStore.selectedProject;
		if (!title || !project) return;

		const newTask: Task = {
			id: Date.now().toString(),
			title,
			assignee: "Не назначен",
			project,
			date: new Date().toLocaleDateString(),
			tags: ["Приоритет 1"], // 👈 вот здесь
			description: "",
			status: column,
		};

		this.data[project][column].push(newTask);
		this.newTaskTitle = "";
	}

	moveTask(
		fromColumn: ColumnType,
		toColumn: ColumnType,
		fromIndex: number,
		toIndex: number
	) {
		const project = projectStore.selectedProject;
		if (!project) return;

		this.initProject(project);

		const task = this.data[project][fromColumn][fromIndex];
		if (!task) return;

		this.data[project][fromColumn].splice(fromIndex, 1);
		this.data[project][toColumn].splice(toIndex, 0, task);
		task.status = toColumn;
	}

	moveTaskToColumn(task: Task, newColumn: ColumnType) {
		const project = projectStore.selectedProject;
		if (!project) return;

		this.initProject(project);

		const oldColumn = task.status;
		const oldTasks = this.data[project][oldColumn];
		const index = oldTasks.findIndex((t) => t.id === task.id);
		if (index !== -1) {
			oldTasks.splice(index, 1);
		}

		task.status = newColumn;
		this.data[project][newColumn].push(task);
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
