import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import PrivateRoute from "./routes/PrivateRoute";
import { observer } from "mobx-react-lite";
import type { FC } from "react";
import loginStore from "./store/LoginStore";
import "./App.css";

const App: FC = observer(() => {
	return (
		<BrowserRouter>
			<Routes>
				<Route
					path="/"
					element={
						<PrivateRoute>
							<Home />
						</PrivateRoute>
					}
				/>
				<Route
					path="/login"
					element={
						loginStore.isAuthenticated ? (
							<Navigate to="/" />
						) : (
							<Login />
						)
					}
				/>
			</Routes>
		</BrowserRouter>
	);
});

export default App;
