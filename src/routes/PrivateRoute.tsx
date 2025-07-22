import { Navigate } from "react-router-dom";
import { observer } from "mobx-react-lite";
import type { FC, PropsWithChildren } from "react";
import loginStore from "../store/LoginStore";

const PrivateRoute: FC<PropsWithChildren> = observer(({ children }) => {
	console.log(loginStore.isAuthenticated);

	return loginStore.isAuthenticated ? children : <Navigate to="/login" />;
});

export default PrivateRoute;
