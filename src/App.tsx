// App.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { observer } from "mobx-react-lite";
import type { FC } from "react";

import Login from "./pages/Login";
import Register from "./pages/Register"; // ✅ ДОБАВИТЬ
import Home from "./pages/Home";
import PrivateRoute from "./routes/PrivateRoute";

import "./App.css";
import loginStore from "./store/LoginStore";
import { OpenAPI } from "./api";

const App: FC = observer(() => {
	// лучше так (если у тебя в .env уже есть VITE_API_URL)
	OpenAPI.BASE = import.meta.env.VITE_API_URL;

	return (
		<BrowserRouter>
			<Routes>
				{/* 🔒 Приватная зона */}
				<Route
					path="/"
					element={
						<PrivateRoute>
							<Home />
						</PrivateRoute>
					}
				/>

				{/* 🌐 Публичные страницы */}
				<Route
					path="/login"
					element={
						loginStore.isAuthenticated ? (
							<Navigate
								to="/"
								replace
							/>
						) : (
							<Login />
						)
					}
				/>

				<Route
					path="/register"
					element={
						loginStore.isAuthenticated ? (
							<Navigate
								to="/"
								replace
							/>
						) : (
							<Register />
						)
					}
				/>

				{/* (опционально) редирект на /login или / */}
				<Route
					path="*"
					element={
						<Navigate
							to="/"
							replace
						/>
					}
				/>
			</Routes>
		</BrowserRouter>
	);
});

export default App;
