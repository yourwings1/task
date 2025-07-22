import { makeAutoObservable } from "mobx";
import taskStore from "./TaskStore";

class ProjectStore {
	projects: string[] = [];
	selectedProject: string = "";

	constructor() {
		makeAutoObservable(this);
	}

	addProject(name: string) {
		const trimmed = name.trim();
		if (!trimmed || this.projects.includes(trimmed)) return;

		this.projects.push(trimmed);
		this.selectProject(trimmed); // ✅ автоматический выбор
		taskStore.initProject(trimmed); // ✅ гарантированная инициализация
	}

	selectProject(name: string) {
		if (this.projects.includes(name)) {
			this.selectedProject = name;
			taskStore.initProject(name); // 🔁 подстраховка, даже при ручном выборе
		}
	}

	removeProject(name: string) {
		const index = this.projects.indexOf(name);
		if (index === -1) return;

		this.projects.splice(index, 1);

		// Сброс выбранного проекта если он удалён
		if (this.selectedProject === name) {
			this.selectedProject = this.projects[0] ?? "";
		}
	}
}

const projectStore = new ProjectStore();
export default projectStore;
