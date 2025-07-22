import type { CSSProperties, FC } from "react";
import { theme, Typography } from "antd";
import { SquareCheckBig } from "lucide-react";

const { Text } = Typography;

interface LogoProps {
	style?: CSSProperties;
	collapsed?: boolean;
}

const Logo: FC<LogoProps> = ({ style, collapsed }) => {
	const { token } = theme.useToken();

	return (
		<Text
			style={{
				fontSize: 28,
				fontWeight: "bold",
				fontFamily:
					"'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif",
				textAlign: "center",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				color: token.colorPrimaryText,
				...style,
			}}
		>
			<SquareCheckBig
				size={30}
				style={{ marginRight: collapsed ? 0 : 10 }}
			/>
			{!collapsed && "ЛТТ Задачи"}
		</Text>
	);
};

export default Logo;
