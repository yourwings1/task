import { Button, Card, Flex, Space, Form, Input, Typography } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { theme } from "antd";
import type { FC } from "react";
import { observer } from "mobx-react-lite";
import loginStore from "../store/LoginStore";
import Logo from "../components/Logo";
import { KeyRound, UserRound } from "lucide-react";

const { Title, Text } = Typography;

const Login: FC = observer(() => {
	const navigate = useNavigate();
	const { token } = theme.useToken();

	const onFinish = () => {
		if (loginStore.username.trim() && loginStore.password.trim()) {
			loginStore.login();
			navigate("/");
		}
	};

	return (
		<Flex
			align="center"
			justify="center"
			style={{
				minHeight: "100vh",
				background: "linear-gradient(to bottom, #f0f2f5, white)",
			}}
		>
			<div>
				<Space direction="vertical">
					<Logo />
					<Card
						style={{ width: 400 }}
						bodyStyle={{ padding: 25 }}
					>
						<div
							style={{
								marginBottom: 24,
								display: "flex",
								alignItems: "bottom",
								justifyContent: "space-between",
							}}
						>
							<Title
								level={4}
								style={{ margin: 0 }}
							>
								Вход{" "}
							</Title>

							<Link
								to="/forgot"
								style={{
									fontSize: 14,
									fontWeight: 400,
								}}
							>
								Забыли пароль?
							</Link>
						</div>

						<Form
							layout="vertical"
							onFinish={onFinish}
						>
							<Form.Item
								name="username"
								rules={[
									{
										required: true,
										message: "Введите логин!",
									},
								]}
							>
								<Input
									size="large"
									placeholder="Логин"
									prefix={<UserRound size={20} />}
									value={loginStore.username}
									onChange={(e) =>
										loginStore.setUsername(e.target.value)
									}
								/>
							</Form.Item>

							<Form.Item
								name="password"
								rules={[
									{
										required: true,
										message: "Введите пароль!",
									},
								]}
							>
								<Input.Password
									size="large"
									placeholder="Пароль"
									prefix={<KeyRound size={20} />}
									value={loginStore.password}
									onChange={(e) =>
										loginStore.setPassword(e.target.value)
									}
								/>
							</Form.Item>

							<Form.Item>
								<Button
									type="primary"
									htmlType="submit"
									block
									size="large"
								>
									Войти
								</Button>
							</Form.Item>
						</Form>

						<Space
							direction="vertical"
							size={0}
							style={{
								width: "100%",
								textAlign: "center",
							}}
						>
							<Text type="secondary">
								У вас ещё нет аккаунта?
							</Text>
							<Link
								to="/register"
								onMouseDown={(e) => e.preventDefault()}
							>
								Зарегистрируйтесь
							</Link>
						</Space>
					</Card>
				</Space>
			</div>
		</Flex>
	);
});

export default Login;
