import {
	Layout,
	Menu,
	Avatar,
	Button,
	Dropdown,
	Switch,
	Space,
	Typography,
	theme,
	Input,
} from "antd";
import { useNavigate } from "react-router-dom";
import { useState, type FC, type ReactNode } from "react";
import { observer } from "mobx-react-lite";
import loginStore from "../store/LoginStore";
import Logo from "./Logo";
import projectStore from "../store/ProjectStore";
import {
	Folder,
	IndentDecrease,
	IndentIncrease,
	ListTodo,
	Logs,
	Plus,
	FolderOpen,
} from "lucide-react";
import {
	SettingOutlined,
	LogoutOutlined,
	MoonOutlined,
} from "@ant-design/icons";

const { Header, Sider, Content } = Layout;

interface PageLayoutProps {
	headerLeft?: ReactNode;
	children: ReactNode;
	activeMenuKey?: string;
	onMenuSelect?: (key: string) => void;
}

const PageLayout: FC<PageLayoutProps> = observer(
	({ headerLeft, children, activeMenuKey = "all-tasks", onMenuSelect }) => {
		const navigate = useNavigate();
		const { token } = theme.useToken();

		const [collapsed, setCollapsed] = useState(false);
		const [newProject, setNewProject] = useState("");
		const [showProjectInput, setShowProjectInput] = useState(false);

		const handleLogout = async () => {
			await loginStore.logout();
			navigate("/login");
		};

		const getInitials = (name: string): string => {
			const parts = name.trim().split(" ").filter(Boolean);

			if (parts.length === 0) return "П";
			if (parts.length === 1) {
				return parts[0].charAt(0).toUpperCase();
			}

			return (
				parts[0].charAt(0).toUpperCase() +
				parts[1].charAt(0).toUpperCase()
			);
		};

		const username =
			loginStore.user?.email || loginStore.email || "Пользователь";

		const topMenuItems = [
			{
				key: "all-tasks",
				icon: <Logs size={16} />,
				label: "Все задачи",
			},
			{
				key: "my-tasks",
				icon: <ListTodo size={16} />,
				label: "Мои задачи",
			},
			{
				key: "all-projects",
				icon: <FolderOpen size={16} />,
				label: "Все проекты",
			},
		];

		const projectMenuItems = projectStore.projects
			.filter((proj) => proj && proj.trim())
			.map((proj) => ({
				key: proj,
				icon: <Folder size={16} />,
				label: proj,
			}));

		return (
			<Layout style={{ height: "100vh" }}>
				<Sider
					collapsible
					collapsed={collapsed}
					trigger={null}
					width={240}
					style={{
						background: "#fff",
						borderRight: "1px solid lightgray",
					}}
				>
					<div
						style={{
							padding: 16,
							display: "flex",
							justifyContent: "center",
							alignItems: "center",
							borderBottom: "1px solid lightgray",
						}}
					>
						<Logo
							collapsed={collapsed}
							style={{ fontSize: 20 }}
						/>
					</div>

					<Menu
						mode="inline"
						selectedKeys={[activeMenuKey]}
						onClick={({ key }) => onMenuSelect?.(key)}
						style={{ border: "none" }}
						items={topMenuItems}
					/>

					{!collapsed && (
						<div
							style={{
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center",
								padding: "8px 16px 4px",
								fontWeight: 500,
								color: "gray",
							}}
						>
							<span>Проекты</span>
							<Plus
								size={16}
								style={{ cursor: "pointer" }}
								onClick={() =>
									setShowProjectInput(!showProjectInput)
								}
							/>
						</div>
					)}

					{showProjectInput && !collapsed && (
						<div style={{ padding: "0 16px 8px" }}>
							<Input
								placeholder="Новый проект"
								value={newProject}
								onChange={(e) => setNewProject(e.target.value)}
								onPressEnter={async () => {
									const value = newProject.trim();

									if (value) {
										await projectStore.addProject(value);
										setNewProject("");
										setShowProjectInput(false);
									}
								}}
								size="small"
								autoFocus
							/>
						</div>
					)}

					<Menu
						mode="inline"
						selectedKeys={
							projectStore.selectedProject
								? [projectStore.selectedProject]
								: []
						}
						onClick={({ key }) => {
							projectStore.selectProject(key);
							onMenuSelect?.("all-tasks");
						}}
						style={{ border: "none" }}
						items={projectMenuItems}
					/>
				</Sider>

				<Layout
					style={{
						display: "flex",
						flexDirection: "row",
						flex: 1,
					}}
				>
					<Layout
						style={{
							display: "flex",
							flexDirection: "column",
							flex: 1,
						}}
					>
						<Header
							style={{
								background: "#fff",
								padding: "0 24px",
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center",
								height: 64,
								borderBottom: "1px solid lightgray",
							}}
						>
							<div
								style={{
									display: "flex",
									alignItems: "center",
									gap: 16,
								}}
							>
								<Button
									type="text"
									icon={
										collapsed ? (
											<IndentIncrease />
										) : (
											<IndentDecrease />
										)
									}
									onClick={() => setCollapsed(!collapsed)}
								/>
								{headerLeft}
							</div>

							<Dropdown
								trigger={["hover"]}
								placement="bottomRight"
								popupRender={() => (
									<div
										style={{
											background: "#fff",
											borderRadius: 8,
											boxShadow:
												"0 4px 12px rgba(0,0,0,0.15)",
											padding: 16,
											width: 240,
										}}
									>
										<Space
											direction="vertical"
											style={{ width: "100%" }}
										>
											<div
												style={{
													display: "flex",
													alignItems: "center",
													gap: 12,
												}}
											>
												<Avatar
													size="large"
													style={{
														backgroundColor:
															token.colorPrimary,
													}}
												>
													{getInitials(username)}
												</Avatar>

												<Typography.Text strong>
													{username}
												</Typography.Text>
											</div>

											<div style={{ marginTop: 12 }}>
												<Space
													direction="vertical"
													size="middle"
													style={{ width: "100%" }}
												>
													<div
														style={{
															display: "flex",
															alignItems:
																"center",
															gap: 8,
														}}
													>
														<SettingOutlined />
														<Typography.Text>
															Настройки аккаунта
														</Typography.Text>
													</div>

													<div
														style={{
															display: "flex",
															justifyContent:
																"space-between",
															alignItems:
																"center",
														}}
													>
														<span
															style={{
																display: "flex",
																alignItems:
																	"center",
																gap: 8,
															}}
														>
															<MoonOutlined />
															Тёмная тема
														</span>
														<Switch size="small" />
													</div>

													<div
														onClick={handleLogout}
														style={{
															display: "flex",
															alignItems:
																"center",
															color: "#ff4d4f",
															cursor: "pointer",
															gap: 8,
														}}
													>
														<LogoutOutlined />
														Выход
													</div>
												</Space>
											</div>
										</Space>
									</div>
								)}
							>
								<Avatar
									style={{
										backgroundColor: token.colorPrimary,
										cursor: "pointer",
									}}
								>
									{getInitials(username)}
								</Avatar>
							</Dropdown>
						</Header>

						<Content
							style={{
								flex: 1,
								minHeight: 0,
								padding: 24,
								background: "#f5f5f5",
							}}
						>
							<div style={{ height: "100%" }}>{children}</div>
						</Content>
					</Layout>
				</Layout>
			</Layout>
		);
	},
);

export default PageLayout;
