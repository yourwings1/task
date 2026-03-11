import { useState, useEffect, type FC } from "react";
import {
	Drawer,
	Typography,
	Tag,
	Input,
	Row,
	Col,
	Divider,
	Button,
	Popconfirm,
	message,
} from "antd";
import {
	UserOutlined,
	ProjectOutlined,
	CalendarOutlined,
	TagOutlined,
	AlignLeftOutlined,
	CloseOutlined,
	EditOutlined,
	CheckOutlined,
	DeleteOutlined,
} from "@ant-design/icons";
import type { Task } from "../store/TaskStore";
import taskStore from "../store/TaskStore";
import { Link } from "lucide-react";

interface Props {
	task: Task | null;
	onClose: () => void;
}

const TaskDetailPanel: FC<Props> = ({ task, onClose }) => {
	const [drawerWidth] = useState(800);
	const [isEditingDescription, setIsEditingDescription] = useState(false);
	const [editedDescription, setEditedDescription] = useState(
		task?.description || "",
	);
	const [api, contextHolder] = message.useMessage();

	useEffect(() => {
		setEditedDescription(task?.description || "");
		setIsEditingDescription(false);
	}, [task]);

	const saveDescription = async () => {
		if (!task) return;

		await taskStore.updateTask(task.id, {
			description: editedDescription,
		});

		api.success("Описание сохранено");
		setIsEditingDescription(false);
	};

	const handleDeleteTask = async () => {
		if (!task) return;

		await taskStore.removeTask(task.id);
		api.success("Задача удалена");
		onClose();
	};

	if (!task) return null;

	return (
		<>
			{contextHolder}

			<Drawer
				open={!!task}
				placement="right"
				onClose={onClose}
				width={drawerWidth}
				closable={false}
				getContainer={false}
				styles={{ body: { padding: 0, height: "100%" } }}
				style={{ position: "absolute" }}
			>
				<div style={{ display: "flex", height: "100%" }}>
					<div
						style={{
							flex: 1,
							padding: 24,
							overflowY: "auto",
							borderLeft: "1px solid #eee",
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
							<Tag color="default">
								<div
									style={{
										display: "flex",
										alignItems: "center",
										gap: 4,
									}}
								>
									<Link size={15} /> #{task.id}
								</div>
							</Tag>

							<CloseOutlined
								style={{ fontSize: 20, cursor: "pointer" }}
								onClick={onClose}
							/>
						</div>

						<Typography.Title level={5}>
							{task.title}
						</Typography.Title>

						<Row
							gutter={[12, 12]}
							style={{ marginTop: 24 }}
						>
							<Col
								span={8}
								style={{ color: "#888" }}
							>
								<UserOutlined /> Создатель
							</Col>
							<Col span={16}>Не назначен</Col>

							<Col
								span={8}
								style={{ color: "#888" }}
							>
								<UserOutlined /> Исполнитель
							</Col>
							<Col span={16}>{task.assignee}</Col>

							<Col
								span={8}
								style={{ color: "#888" }}
							>
								<ProjectOutlined /> Проект
							</Col>
							<Col span={16}>{task.project}</Col>

							<Col
								span={8}
								style={{ color: "#888" }}
							>
								<CalendarOutlined /> Дата
							</Col>
							<Col span={16}>{task.date}</Col>

							<Col
								span={8}
								style={{ color: "#888" }}
							>
								<TagOutlined /> Теги
							</Col>
							<Col span={16}>
								{task.tags.length ? (
									task.tags.map((tag, i) => (
										<Tag
											key={i}
											color="blue"
										>
											{tag}
										</Tag>
									))
								) : (
									<Tag color="red">Приоритет 1</Tag>
								)}
							</Col>

							<Col
								span={8}
								style={{ color: "#888" }}
							>
								<AlignLeftOutlined /> Статус
							</Col>
							<Col span={16}>
								{taskStore.getColumnTitle(task.status)}
							</Col>
						</Row>

						<Divider />

						<div style={{ marginTop: 32 }}>
							<div
								style={{
									display: "flex",
									alignItems: "center",
									marginBottom: 8,
									gap: 8,
								}}
							>
								<AlignLeftOutlined />
								<Typography.Text strong>
									Описание
								</Typography.Text>

								{!isEditingDescription ? (
									<EditOutlined
										style={{ cursor: "pointer" }}
										onClick={() =>
											setIsEditingDescription(true)
										}
									/>
								) : (
									<CheckOutlined
										style={{
											cursor: "pointer",
											color: "green",
										}}
										onClick={saveDescription}
									/>
								)}
							</div>

							{!isEditingDescription ? (
								<Typography.Paragraph>
									{task.description || "Описание отсутствует"}
								</Typography.Paragraph>
							) : (
								<Input.TextArea
									value={editedDescription}
									autoSize={{ minRows: 3 }}
									onChange={(e) =>
										setEditedDescription(e.target.value)
									}
								/>
							)}
						</div>

						<Divider />

						<Popconfirm
							title="Удалить задачу?"
							description="Это действие нельзя отменить."
							okText="Удалить"
							cancelText="Отмена"
							okButtonProps={{ danger: true }}
							onConfirm={handleDeleteTask}
						>
							<Button
								danger
								icon={<DeleteOutlined />}
							>
								Удалить задачу
							</Button>
						</Popconfirm>
					</div>
				</div>
			</Drawer>
		</>
	);
};

export default TaskDetailPanel;
