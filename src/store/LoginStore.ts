import { makeAutoObservable } from "mobx";

class LoginStore {
	isAuthenticated = false;
	username = "";
	password = "";

	constructor() {
		makeAutoObservable(this);
	}

	setUsername(value: string) {
		this.username = value;
	}

	setPassword(value: string) {
		this.password = value;
	}

	login() {
		if (this.username.trim() && this.password.trim()) {
			this.isAuthenticated = true;
		}
	}

	logout() {
		this.isAuthenticated = false;
		this.username = "";
		this.password = "";
	}
}

const loginStore = new LoginStore();
export default loginStore;
