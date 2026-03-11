import { Navigate } from "react-router-dom";
import { observer } from "mobx-react-lite";
import type { FC, PropsWithChildren } from "react";
import loginStore from "../store/LoginStore";
import { Spin } from "antd";

const PrivateRoute: FC<PropsWithChildren> = observer(({ children }) => {
	if (!loginStore.isInitialized) {
		return (
			<div
				style={{
					minHeight: "100vh",
					display: "grid",
					placeItems: "center",
				}}
			>
				<Spin size="large" />
			</div>
		);
	}

	return loginStore.isAuthenticated ? (
		children
	) : (
		<Navigate
			to="/login"
			replace
		/>
	);
});

export default PrivateRoute;
