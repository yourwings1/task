import { useState, type FC } from "react";
import { Typography, Tag, Input, Row, Col, Divider, FloatButton } from "antd";
import {
	UserOutlined,
	ProjectOutlined,
	CalendarOutlined,
	TagOutlined,
	AlignLeftOutlined,
	CloseOutlined,
	EditOutlined,
	CheckOutlined,
} from "@ant-design/icons";
import { runInAction } from "mobx";
import type { Task } from "../store/TaskStore";
import taskStore from "../store/TaskStore";

interface Props {
	task: Task | null;
	onClose: () => void;
}

const TaskDetailPanel: FC<Props> = ({ task, onClose }) => {
	const [isEditingDescription, setIsEditingDescription] = useState(false);
	const [editedDescription, setEditedDescription] = useState(
		task?.description || ""
	);

	if (!task) return null;

	const saveDescription = () => {
		runInAction(() => {
			task.description = editedDescription;
		});
		setIsEditingDescription(false);
	};

	return (
		<div
			style={{
				borderLeft: "1px solid #eee",
				height: "100%",
				padding: 24,
				overflowY: "auto",
				minWidth: 320,
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
				<div
					style={{
						display: "flex",
						alignItems: "center",
						gap: 8,
					}}
				>
					<Tag color="default">#12345</Tag>
					<Typography.Title
						level={4}
						style={{ margin: 0 }}
					>
						{task.project || "Без проекта"}
					</Typography.Title>
				</div>

				<CloseOutlined
					style={{ fontSize: 20, cursor: "pointer" }}
					onClick={onClose}
				/>
			</div>

			<Typography.Title level={5}>{task.title}</Typography.Title>

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
				<Col span={16}>{taskStore.getColumnTitle(task.status)}</Col>
			</Row>

			<Divider />

			<div style={{ marginTop: 32 }}>
				<div
					style={{
						display: "flex",
						alignItems: "center",
						marginBottom: 8,
					}}
				>
					<AlignLeftOutlined style={{ marginRight: 8 }} />
					<Typography.Text
						strong
						style={{ marginRight: 8 }}
					>
						Описание
					</Typography.Text>
					{!isEditingDescription ? (
						<EditOutlined
							style={{ cursor: "pointer" }}
							onClick={() => setIsEditingDescription(true)}
						/>
					) : (
						<CheckOutlined
							style={{ cursor: "pointer", color: "green" }}
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
						onChange={(e) => setEditedDescription(e.target.value)}
					/>
				)}
			</div>
		</div>
	);
};

export default TaskDetailPanel;
