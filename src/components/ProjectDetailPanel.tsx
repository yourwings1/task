import { useState, type FC } from "react";
import {
	Button,
	Divider,
	Drawer,
	Input,
	List,
	Popconfirm,
	Select,
	Space,
	Tag,
	Typography,
} from "antd";
import {
	CloseOutlined,
	DeleteOutlined,
	FolderOpenOutlined,
	TagOutlined,
	TeamOutlined,
	UserAddOutlined,
} from "@ant-design/icons";
import { observer } from "mobx-react-lite";
import projectStore from "../store/ProjectStore";
import taskStore from "../store/TaskStore";

interface Props {
	projectName: string | null;
	onClose: () => void;
}

const tagColors = ["blue", "green", "red", "orange", "purple", "cyan", "magenta"];

const ProjectDetailPanel: FC<Props> = observer(({ projectName, onClose }) => {
	const [memberName, setMemberName] = useState("");
	const [memberEmail, setMemberEmail] = useState("");
	const [memberRole, setMemberRole] = useState("Developer");
	const [tagName, setTagName] = useState("");
	const [tagColor, setTagColor] = useState("blue");

	if (!projectName) return null;

	const members = projectStore.getProjectMembers(projectName);
	const tags = projectStore.getProjectTags(projectName);
	const tasks = taskStore.data[projectName]
		? [
				...taskStore.data[projectName].open,
				...taskStore.data[projectName].inProgress,
				...taskStore.data[projectName].review,
				...taskStore.data[projectName].done,
			]
		: [];

	const handleDelete = async () => {
		await projectStore.removeProject(projectName);
		onClose();
	};

	const addMember = () => {
		projectStore.addProjectMember(projectName, {
			name: memberName,
			email: memberEmail,
			role: memberRole,
		});
		setMemberName("");
		setMemberEmail("");
		setMemberRole("Developer");
	};

	const addTag = () => {
		projectStore.addProjectTag(projectName, {
			name: tagName,
			color: tagColor,
		});
		setTagName("");
		setTagColor("blue");
	};

	return (
		<Drawer
			open={!!projectName}
			placement="right"
			onClose={onClose}
			width={560}
			closable={false}
			getContainer={false}
			styles={{ body: { padding: 0, height: "100%" } }}
			style={{ position: "absolute" }}
		>
			<div
				style={{
					height: "100%",
					padding: 24,
					overflowY: "auto",
					borderLeft: "1px solid #eee",
					background: "#fff",
				}}
			>
				<div
					style={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						marginBottom: 24,
						paddingBottom: 16,
						borderBottom: "1px solid #eee",
					}}
				>
					<Space>
						<FolderOpenOutlined />
						<Typography.Title level={4} style={{ margin: 0 }}>
							{projectName}
						</Typography.Title>
					</Space>

					<CloseOutlined
						style={{ fontSize: 18, cursor: "pointer" }}
						onClick={onClose}
					/>
				</div>

				<Space direction="vertical" size="middle" style={{ width: "100%" }}>
					<div>
						<Typography.Text type="secondary">Название проекта</Typography.Text>
						<div style={{ marginTop: 4 }}>{projectName}</div>
					</div>

					<div>
						<Typography.Text type="secondary">Количество задач</Typography.Text>
						<div style={{ marginTop: 4 }}>{tasks.length}</div>
					</div>
				</Space>

				<Divider />

				<Space style={{ marginBottom: 12 }}>
					<TeamOutlined />
					<Typography.Text strong>Участники</Typography.Text>
				</Space>

				<Space.Compact style={{ width: "100%", marginBottom: 8 }}>
					<Input
						value={memberName}
						placeholder="Имя"
						onChange={(event) => setMemberName(event.target.value)}
					/>
					<Input
						value={memberEmail}
						placeholder="Email"
						onChange={(event) => setMemberEmail(event.target.value)}
					/>
				</Space.Compact>
				<Space.Compact style={{ width: "100%", marginBottom: 12 }}>
					<Select
						value={memberRole}
						onChange={setMemberRole}
						style={{ width: "100%" }}
						options={["Owner", "Maintainer", "Developer", "Reporter"].map(
							(role) => ({ value: role, label: role }),
						)}
					/>
					<Button icon={<UserAddOutlined />} onClick={addMember}>
						Добавить
					</Button>
				</Space.Compact>

				<List
					size="small"
					dataSource={members}
					locale={{ emptyText: "Участников пока нет" }}
					renderItem={(member) => (
						<List.Item
							actions={[
								<Button
									key="delete"
									type="text"
									danger
									icon={<DeleteOutlined />}
									onClick={() =>
										projectStore.removeProjectMember(projectName, member.id)
									}
								/>,
							]}
						>
							<List.Item.Meta
								title={member.name}
								description={`${member.email || "без email"} · ${member.role}`}
							/>
						</List.Item>
					)}
				/>

				<Divider />

				<Space style={{ marginBottom: 12 }}>
					<TagOutlined />
					<Typography.Text strong>Теги</Typography.Text>
				</Space>

				<Space.Compact style={{ width: "100%", marginBottom: 12 }}>
					<Input
						value={tagName}
						placeholder="Название тега"
						onChange={(event) => setTagName(event.target.value)}
					/>
					<Select
						value={tagColor}
						onChange={setTagColor}
						style={{ width: 140 }}
						options={tagColors.map((color) => ({
							value: color,
							label: color,
						}))}
					/>
					<Button icon={<TagOutlined />} onClick={addTag}>
						Добавить
					</Button>
				</Space.Compact>

				<List
					size="small"
					dataSource={tags}
					locale={{ emptyText: "Тегов пока нет" }}
					renderItem={(tag) => (
						<List.Item
							actions={[
								<Button
									key="delete"
									type="text"
									danger
									icon={<DeleteOutlined />}
									onClick={() =>
										projectStore.removeProjectTag(projectName, tag.id)
									}
								/>,
							]}
						>
							<Tag color={tag.color}>{tag.name}</Tag>
						</List.Item>
					)}
				/>

				<Divider />

				<Popconfirm
					title="Удалить проект?"
					description="Проект и все его задачи будут удалены."
					okText="Удалить"
					cancelText="Отмена"
					okButtonProps={{ danger: true }}
					onConfirm={handleDelete}
				>
					<Button danger icon={<DeleteOutlined />}>
						Удалить проект
					</Button>
				</Popconfirm>
			</div>
		</Drawer>
	);
});

export default ProjectDetailPanel;
