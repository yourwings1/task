import { makeAutoObservable, runInAction } from "mobx";
import {
	onAuthStateChanged,
	signInWithEmailAndPassword,
	createUserWithEmailAndPassword,
	signOut,
	type User,
} from "firebase/auth";
import { auth } from "../firebase/firebase";

class LoginStore {
	isAuthenticated = false;
	isLoading = false;
	isInitialized = false;

	user: User | null = null;

	email = "";
	password = "";

	constructor() {
		makeAutoObservable(this);
		this.initAuthListener();
	}

	private initAuthListener() {
		onAuthStateChanged(auth, (user) => {
			runInAction(() => {
				this.user = user;
				this.isAuthenticated = !!user;
				this.isInitialized = true;
			});
		});
	}

	setEmail(value: string) {
		this.email = value;
	}

	setPassword(value: string) {
		this.password = value;
	}

	async login() {
		this.isLoading = true;

		try {
			const email = this.email.trim().toLowerCase();
			const password = this.password;

			if (!email || !password) {
				throw new Error("Введите email и пароль");
			}

			await signInWithEmailAndPassword(auth, email, password);
		} finally {
			runInAction(() => {
				this.isLoading = false;
			});
		}
	}

	async register() {
		this.isLoading = true;

		try {
			const email = this.email.trim().toLowerCase();
			const password = this.password;

			if (!email || !password) {
				throw new Error("Введите email и пароль");
			}

			await createUserWithEmailAndPassword(auth, email, password);
		} finally {
			runInAction(() => {
				this.isLoading = false;
			});
		}
	}

	async logout() {
		await signOut(auth);

		runInAction(() => {
			this.email = "";
			this.password = "";
		});
	}
}

const loginStore = new LoginStore();
export default loginStore;
