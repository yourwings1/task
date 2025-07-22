import { createRoot } from "react-dom/client";

import App from "./App.tsx";
import { ConfigProvider } from "antd";

createRoot(document.getElementById("root")!).render(
	// <StrictMode>
	<ConfigProvider
		theme={{
			token: {
				colorPrimary: "#570ff2ff",
				colorLink: "#570ff2ff",
			},
		}}
	>
		<App />
	</ConfigProvider>
	// </StrictMode>,
);
