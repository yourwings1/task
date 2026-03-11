import {
	Button,
	Card,
	Flex,
	Space,
	Form,
	Input,
	Typography,
	message,
} from "antd";
import { Link, useNavigate } from "react-router-dom";
import type { FC } from "react";
import { observer } from "mobx-react-lite";
import loginStore from "../store/LoginStore";
import Logo from "../components/Logo";
import { KeyRound, UserRound } from "lucide-react";
import { getFirebaseAuthErrorMessage } from "../shared/firebaseErrorMessage";

const { Title, Text } = Typography;

const Register: FC = observer(() => {
	const navigate = useNavigate();
	const [api, contextHolder] = message.useMessage();

	const onFinish = async () => {
		try {
			await loginStore.register();
			api.success("Аккаунт создан");
			navigate("/");
		} catch (e) {
			api.error(getFirebaseAuthErrorMessage(e));
		}
	};

	return (
		<>
			{contextHolder}

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
							styles={{ body: { padding: 25 } }}
						>
							<Title
								level={4}
								style={{ marginTop: 0 }}
							>
								Регистрация
							</Title>

							<Form
								layout="vertical"
								onFinish={onFinish}
								autoComplete="on"
							>
								<Form.Item
									name="email"
									rules={[
										{
											required: true,
											message: "Введите email!",
										},
										{
											type: "email",
											message: "Email некорректный",
										},
									]}
								>
									<Input
										size="large"
										placeholder="Email"
										prefix={<UserRound size={20} />}
										value={loginStore.email}
										onChange={(e) =>
											loginStore.setEmail(e.target.value)
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
										{
											min: 6,
											message: "Минимум 6 символов",
										},
									]}
								>
									<Input.Password
										size="large"
										placeholder="Пароль"
										prefix={<KeyRound size={20} />}
										value={loginStore.password}
										onChange={(e) =>
											loginStore.setPassword(
												e.target.value,
											)
										}
									/>
								</Form.Item>

								<Form.Item style={{ marginBottom: 12 }}>
									<Button
										type="primary"
										htmlType="submit"
										block
										size="large"
										loading={loginStore.isLoading}
									>
										Создать аккаунт
									</Button>
								</Form.Item>
							</Form>

							<Text type="secondary">
								Уже есть аккаунт? <Link to="/login">Войти</Link>
							</Text>
						</Card>
					</Space>
				</div>
			</Flex>
		</>
	);
});

export default Register;
