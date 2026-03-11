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

class ProjectStore {
	projects: string[] = [];
	selectedProject: string = "";

	private unsubscribeProjects: null | (() => void) = null;
	private projectIdsByName = new Map<string, string>();

	constructor() {
		makeAutoObservable(this);
		this.initAuthListener();
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
			this.selectedProject = name;
			taskStore.subscribeToProject(name);
		}
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

		if (this.selectedProject === name) {
			this.selectedProject = "";
			taskStore.clearCurrentProject();
		}
	}
}

const projectStore = new ProjectStore();
export default projectStore;
