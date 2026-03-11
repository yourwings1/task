import { FirebaseError } from "firebase/app";

export function getFirebaseAuthErrorMessage(err: unknown): string {
	// Firebase почти всегда кидает FirebaseError с code вида "auth/..."
	if (err instanceof FirebaseError) {
		switch (err.code) {
			case "auth/invalid-credential":
				return "Неверная почта или пароль.";
			case "auth/user-not-found":
				return "Пользователь не найден. Проверьте почту или зарегистрируйтесь.";
			case "auth/wrong-password":
				return "Неверный пароль.";
			case "auth/invalid-email":
				return "Некорректный формат почты.";
			case "auth/email-already-in-use":
				return "Эта почта уже зарегистрирована. Попробуйте войти.";
			case "auth/weak-password":
				return "Слишком простой пароль. Минимум 6 символов.";
			case "auth/too-many-requests":
				return "Слишком много попыток. Подождите немного и попробуйте снова.";
			case "auth/network-request-failed":
				return "Ошибка сети. Проверьте интернет/VPN и попробуйте снова.";
			default:
				return `Ошибка авторизации: ${err.code}`;
		}
	}

	// На всякий случай
	if (err instanceof Error) return err.message;
	return "Неизвестная ошибка. Попробуйте ещё раз.";
}
