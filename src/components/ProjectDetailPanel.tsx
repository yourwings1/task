import type { FC } from "react";
import { Drawer, Typography, Divider, Button, Popconfirm, Space } from "antd";
import {
	FolderOpenOutlined,
	DeleteOutlined,
	CloseOutlined,
} from "@ant-design/icons";
import projectStore from "../store/ProjectStore";
import taskStore from "../store/TaskStore";

interface Props {
	projectName: string | null;
	onClose: () => void;
}

const ProjectDetailPanel: FC<Props> = ({ projectName, onClose }) => {
	if (!projectName) return null;

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

	return (
		<Drawer
			open={!!projectName}
			placement="right"
			onClose={onClose}
			width={520}
			closable={false}
			getContainer={false}
			styles={{ body: { padding: 0, height: "100%" } }}
			style={{ position: "absolute" }}
		>
			<div
				style={{
					height: "100%",
					padding: 24,
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
						<Typography.Title
							level={4}
							style={{ margin: 0 }}
						>
							{projectName}
						</Typography.Title>
					</Space>

					<CloseOutlined
						style={{ fontSize: 18, cursor: "pointer" }}
						onClick={onClose}
					/>
				</div>

				<Space
					direction="vertical"
					size="middle"
					style={{ width: "100%" }}
				>
					<div>
						<Typography.Text type="secondary">
							Название проекта
						</Typography.Text>
						<div style={{ marginTop: 4 }}>{projectName}</div>
					</div>

					<div>
						<Typography.Text type="secondary">
							Количество задач
						</Typography.Text>
						<div style={{ marginTop: 4 }}>{tasks.length}</div>
					</div>
				</Space>

				<Divider />

				<Popconfirm
					title="Удалить проект?"
					description="Проект и все его задачи будут удалены."
					okText="Удалить"
					cancelText="Отмена"
					okButtonProps={{ danger: true }}
					onConfirm={handleDelete}
				>
					<Button
						danger
						icon={<DeleteOutlined />}
					>
						Удалить проект
					</Button>
				</Popconfirm>
			</div>
		</Drawer>
	);
};

export default ProjectDetailPanel;
