import { makeAutoObservable, runInAction } from "mobx";
import { onAuthStateChanged } from "firebase/auth";
import {
	addDoc,
	collection,
	doc,
	onSnapshot,
	orderBy,
	query,
	Timestamp,
	getDocs,
	writeBatch,
} from "firebase/firestore";
import { auth, db } from "../firebase/firebase";
import taskStore from "./TaskStore";

type ProjectDoc = {
	name: string;
	createdAt?: Timestamp;
};

export interface ProjectMember {
	id: string;
	name: string;
	email: string;
	role: string;
	joinedAt: string;
}

export interface ProjectTag {
	id: string;
	name: string;
	color: string;
}

interface ProjectMeta {
	members: ProjectMember[];
	tags: ProjectTag[];
}

const PROJECT_META_STORAGE_KEY = "task-hub:project-meta";

const createLocalId = () =>
	`${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

class ProjectStore {
	projects: string[] = [];
	selectedProject: string = "";
	projectMeta: Record<string, ProjectMeta> = {};

	private unsubscribeProjects: null | (() => void) = null;
	private projectIdsByName = new Map<string, string>();

	constructor() {
		makeAutoObservable(this);
		this.loadProjectMeta();
		this.initAuthListener();
	}

	private loadProjectMeta() {
		try {
			const raw = localStorage.getItem(PROJECT_META_STORAGE_KEY);
			this.projectMeta = raw ? JSON.parse(raw) : {};
		} catch {
			this.projectMeta = {};
		}
	}

	private saveProjectMeta() {
		localStorage.setItem(
			PROJECT_META_STORAGE_KEY,
			JSON.stringify(this.projectMeta),
		);
	}

	private ensureProjectMeta(projectName: string) {
		if (!this.projectMeta[projectName]) {
			this.projectMeta[projectName] = {
				members: [],
				tags: [],
			};
		}

		const user = auth.currentUser;

		if (
			user &&
			!this.projectMeta[projectName].members.some(
				(member) => member.id === user.uid,
			)
		) {
			this.projectMeta[projectName].members.unshift({
				id: user.uid,
				name: user.displayName || user.email || "Текущий пользователь",
				email: user.email || "",
				role: "Owner",
				joinedAt: new Date().toISOString(),
			});
		}
	}

	private initAuthListener() {
		onAuthStateChanged(auth, (user) => {
			if (this.unsubscribeProjects) {
				this.unsubscribeProjects();
				this.unsubscribeProjects = null;
			}

			this.projectIdsByName.clear();

			if (!user) {
				runInAction(() => {
					this.projects = [];
					this.selectedProject = "";
				});
				taskStore.clearAll();
				return;
			}

			const projectsRef = collection(db, "users", user.uid, "projects");
			const q = query(projectsRef, orderBy("createdAt", "asc"));

			this.unsubscribeProjects = onSnapshot(q, (snapshot) => {
				const nextProjects: string[] = [];
				const nextMap = new Map<string, string>();

				snapshot.forEach((docSnap) => {
					const data = docSnap.data() as ProjectDoc;
					nextProjects.push(data.name);
					nextMap.set(data.name, docSnap.id);
				});

				runInAction(() => {
					this.projects = nextProjects;
					this.projectIdsByName = nextMap;

					if (
						this.selectedProject &&
						!this.projects.includes(this.selectedProject)
					) {
						this.selectedProject = this.projects[0] ?? "";
					}

					this.projects.forEach((project) => {
						this.ensureProjectMeta(project);
					});
					this.saveProjectMeta();
				});

				if (this.selectedProject) {
					taskStore.subscribeToProject(this.selectedProject);
				}
			});
		});
	}

	getProjectIdByName(name: string): string | undefined {
		return this.projectIdsByName.get(name);
	}

	async addProject(name: string) {
		const trimmed = name.trim();
		const user = auth.currentUser;

		if (!user || !trimmed || this.projects.includes(trimmed)) return;

		const projectsRef = collection(db, "users", user.uid, "projects");

		await addDoc(projectsRef, {
			name: trimmed,
			createdAt: Timestamp.now(),
		});

		this.selectProject(trimmed);
	}

	selectProject(name: string) {
		if (this.projects.includes(name)) {
			this.ensureProjectMeta(name);
			this.saveProjectMeta();
			this.selectedProject = name;
			taskStore.subscribeToProject(name);
		}
	}

	getProjectMembers(projectName: string): ProjectMember[] {
		this.ensureProjectMeta(projectName);
		return this.projectMeta[projectName].members;
	}

	getProjectTags(projectName: string): ProjectTag[] {
		this.ensureProjectMeta(projectName);
		return this.projectMeta[projectName].tags;
	}

	getMemberLabel(projectName: string, memberIdOrName: string): string {
		const member = this
			.getProjectMembers(projectName)
			.find((item) => item.id === memberIdOrName || item.name === memberIdOrName);

		return member?.name ?? memberIdOrName;
	}

	getTag(projectName: string, tagIdOrName: string): ProjectTag | undefined {
		return this
			.getProjectTags(projectName)
			.find((item) => item.id === tagIdOrName || item.name === tagIdOrName);
	}

	addProjectMember(projectName: string, member: Omit<ProjectMember, "id" | "joinedAt">) {
		const name = member.name.trim();
		const email = member.email.trim();

		if (!name && !email) return;

		this.ensureProjectMeta(projectName);

		this.projectMeta[projectName].members.push({
			id: createLocalId(),
			name: name || email,
			email,
			role: member.role.trim() || "Developer",
			joinedAt: new Date().toISOString(),
		});
		this.saveProjectMeta();
	}

	removeProjectMember(projectName: string, memberId: string) {
		this.ensureProjectMeta(projectName);
		this.projectMeta[projectName].members = this.projectMeta[
			projectName
		].members.filter((member) => member.id !== memberId);
		this.saveProjectMeta();
	}

	addProjectTag(projectName: string, tag: Omit<ProjectTag, "id">) {
		const name = tag.name.trim();

		if (!name) return;

		this.ensureProjectMeta(projectName);

		this.projectMeta[projectName].tags.push({
			id: createLocalId(),
			name,
			color: tag.color || "blue",
		});
		this.saveProjectMeta();
	}

	removeProjectTag(projectName: string, tagId: string) {
		this.ensureProjectMeta(projectName);
		this.projectMeta[projectName].tags = this.projectMeta[
			projectName
		].tags.filter((tag) => tag.id !== tagId);
		this.saveProjectMeta();
	}

	async removeProject(name: string) {
		const user = auth.currentUser;
		const projectId = this.projectIdsByName.get(name);

		if (!user || !projectId) return;

		const tasksRef = collection(
			db,
			"users",
			user.uid,
			"projects",
			projectId,
			"tasks",
		);

		const tasksSnapshot = await getDocs(tasksRef);
		const batch = writeBatch(db);

		tasksSnapshot.forEach((taskDoc) => {
			batch.delete(taskDoc.ref);
		});

		const projectRef = doc(db, "users", user.uid, "projects", projectId);
		batch.delete(projectRef);

		await batch.commit();

		delete this.projectMeta[name];
		this.saveProjectMeta();

		if (this.selectedProject === name) {
			this.selectedProject = "";
			taskStore.clearCurrentProject();
		}
	}
}

const projectStore = new ProjectStore();
export default projectStore;
