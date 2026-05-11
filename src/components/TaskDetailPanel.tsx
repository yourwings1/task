import { useEffect, useState, type FC } from "react";
import {
	Button,
	Col,
	Divider,
	Drawer,
	Input,
	List,
	Popconfirm,
	Row,
	Select,
	Space,
	Tag,
	Typography,
	Upload,
	message,
} from "antd";
import {
	AlignLeftOutlined,
	CalendarOutlined,
	CheckOutlined,
	CloseOutlined,
	DeleteOutlined,
	EditOutlined,
	FileAddOutlined,
	PaperClipOutlined,
	ProjectOutlined,
	TagOutlined,
	UserOutlined,
} from "@ant-design/icons";
import { Link } from "lucide-react";
import { observer } from "mobx-react-lite";
import type { ColumnType, Task } from "../store/TaskStore";
import taskStore from "../store/TaskStore";
import projectStore from "../store/ProjectStore";

interface Props {
	task: Task | null;
	onClose: () => void;
}

const statusOptions: ColumnType[] = ["open", "inProgress", "review", "done"];
const priorityOptions = ["Низкий", "Средний", "Высокий", "Критичный"];

const formatAttachmentSize = (size: number) => {
	if (size < 1024) return `${size} Б`;
	if (size < 1024 * 1024) return `${Math.round(size / 1024)} КБ`;
	return `${(size / 1024 / 1024).toFixed(1)} МБ`;
};

const TaskDetailPanel: FC<Props> = observer(({ task, onClose }) => {
	const [isEditingDescription, setIsEditingDescription] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const currentTask = task ? taskStore.findTaskById(task.id) ?? task : null;
	const [editedTitle, setEditedTitle] = useState("");
	const [editedAssigneeId, setEditedAssigneeId] = useState("");
	const [editedPriority, setEditedPriority] = useState("Средний");
	const [editedStatus, setEditedStatus] = useState<ColumnType>("open");
	const [editedDueDate, setEditedDueDate] = useState("");
	const [editedTags, setEditedTags] = useState<string[]>([]);
	const [editedTimeEstimate, setEditedTimeEstimate] = useState("");
	const [editedDescription, setEditedDescription] = useState("");
	const [api, contextHolder] = message.useMessage();

	useEffect(() => {
		if (!currentTask) return;

		setEditedTitle(currentTask.title);
		setEditedAssigneeId(currentTask.assigneeId || "");
		setEditedPriority(currentTask.priority);
		setEditedStatus(currentTask.status);
		setEditedDueDate(currentTask.dueDate);
		setEditedTags(currentTask.tags);
		setEditedTimeEstimate(currentTask.timeEstimate);
		setEditedDescription(currentTask.description);
		setIsEditingDescription(false);
	}, [currentTask]);

	if (!currentTask) return null;

	const members = projectStore.getProjectMembers(currentTask.project);
	const tags = projectStore.getProjectTags(currentTask.project);
	const selectedAssignee = members.find((member) => member.id === editedAssigneeId);

	const saveTaskChanges = async () => {
		const title = editedTitle.trim();

		if (!title) {
			api.warning("Название задачи не может быть пустым");
			return;
		}

		setIsSaving(true);

		try {
			await taskStore.updateTask(currentTask.id, {
				title,
				assignee: selectedAssignee?.name ?? "Не назначен",
				assigneeId: selectedAssignee?.id ?? "",
				priority: editedPriority,
				status: editedStatus,
				dueDate: editedDueDate,
				tags: editedTags,
				timeEstimate: editedTimeEstimate,
				description: editedDescription,
				order:
					currentTask.status === editedStatus
						? currentTask.order
						: taskStore.columns[editedStatus].length,
			});

			api.success("Задача сохранена");
			setIsEditingDescription(false);
		} finally {
			setIsSaving(false);
		}
	};

	const handleDeleteTask = async () => {
		await taskStore.removeTask(currentTask.id);
		api.success("Задача удалена");
		onClose();
	};

	return (
		<>
			{contextHolder}

			<Drawer
				open={!!task}
				placement="right"
				onClose={onClose}
				width={820}
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
							<Space size={4}>
								<Link size={15} />#{currentTask.id}
							</Space>
						</Tag>

						<CloseOutlined
							style={{ fontSize: 20, cursor: "pointer" }}
							onClick={onClose}
						/>
					</div>

					<Input
						value={editedTitle}
						onChange={(event) => setEditedTitle(event.target.value)}
						placeholder="Название задачи"
						style={{
							border: "none",
							borderBottom: "1px solid #eee",
							borderRadius: 0,
							boxShadow: "none",
							fontSize: 18,
							fontWeight: 600,
							paddingLeft: 0,
						}}
					/>

					<Row
						gutter={[12, 12]}
						style={{ marginTop: 24 }}
					>
						<Col span={8} style={{ color: "#888" }}>
							<UserOutlined /> Создатель
						</Col>
						<Col span={16}>{currentTask.creator}</Col>

						<Col span={8} style={{ color: "#888" }}>
							<UserOutlined /> Исполнитель
						</Col>
						<Col span={16}>
							<Select
								allowClear
								value={editedAssigneeId || undefined}
								placeholder="Не назначен"
								onChange={(value) => setEditedAssigneeId(value ?? "")}
								style={{ width: "100%" }}
								options={members.map((member) => ({
									value: member.id,
									label: `${member.name}${member.role ? ` · ${member.role}` : ""}`,
								}))}
							/>
						</Col>

						<Col span={8} style={{ color: "#888" }}>
							<ProjectOutlined /> Проект
						</Col>
						<Col span={16}>{currentTask.project}</Col>

						<Col span={8} style={{ color: "#888" }}>
							<CalendarOutlined /> Дата создания
						</Col>
						<Col span={16}>{currentTask.date}</Col>

						<Col span={8} style={{ color: "#888" }}>
							<CalendarOutlined /> Дедлайн
						</Col>
						<Col span={16}>
							<Input
								type="date"
								value={editedDueDate}
								onChange={(event) => setEditedDueDate(event.target.value)}
							/>
						</Col>

						<Col span={8} style={{ color: "#888" }}>
							<TagOutlined /> Теги
						</Col>
						<Col span={16}>
							<Select
								mode="multiple"
								value={editedTags}
								placeholder="Выберите теги проекта"
								onChange={setEditedTags}
								style={{ width: "100%" }}
								options={tags.map((tag) => ({
									value: tag.id,
									label: tag.name,
								}))}
							/>
						</Col>

						<Col span={8} style={{ color: "#888" }}>
							<AlignLeftOutlined /> Статус
						</Col>
						<Col span={16}>
							<Select
								value={editedStatus}
								onChange={setEditedStatus}
								style={{ width: "100%" }}
								options={statusOptions.map((status) => ({
									value: status,
									label: taskStore.getColumnTitle(status),
								}))}
							/>
						</Col>

						<Col span={8} style={{ color: "#888" }}>
							<TagOutlined /> Приоритет
						</Col>
						<Col span={16}>
							<Select
								value={editedPriority}
								onChange={setEditedPriority}
								style={{ width: "100%" }}
								options={priorityOptions.map((priority) => ({
									value: priority,
									label: priority,
								}))}
							/>
						</Col>

						<Col span={8} style={{ color: "#888" }}>
							<CalendarOutlined /> Фактическое окончание
						</Col>
						<Col span={16}>{currentTask.completedAt || "Пока не закрыта"}</Col>

						<Col span={8} style={{ color: "#888" }}>
							<CalendarOutlined /> Оценка времени
						</Col>
						<Col span={16}>
							<Input
								value={editedTimeEstimate}
								onChange={(event) =>
									setEditedTimeEstimate(event.target.value)
								}
								placeholder="Например: 4ч"
							/>
						</Col>

						<Col span={8} style={{ color: "#888" }}>
							<CalendarOutlined /> Затрачено
						</Col>
						<Col span={16}>{currentTask.timeSpent || "Посчитается при закрытии"}</Col>
					</Row>

					{editedTags.length > 0 && (
						<div style={{ marginTop: 12 }}>
							{editedTags.map((tagId) => {
								const tag = projectStore.getTag(currentTask.project, tagId);

								return (
									<Tag
										key={tagId}
										color={tag?.color || "blue"}
									>
										{tag?.name ?? tagId}
									</Tag>
								);
							})}
						</div>
					)}

					<Divider />

					<div>
						<Space style={{ marginBottom: 8 }}>
							<AlignLeftOutlined />
							<Typography.Text strong>Описание</Typography.Text>
							{!isEditingDescription ? (
								<EditOutlined
									style={{ cursor: "pointer" }}
									onClick={() => setIsEditingDescription(true)}
								/>
							) : (
								<CheckOutlined
									style={{ cursor: "pointer", color: "green" }}
									onClick={saveTaskChanges}
								/>
							)}
						</Space>

						{!isEditingDescription ? (
							<Typography.Paragraph>
								{editedDescription || "Описание отсутствует"}
							</Typography.Paragraph>
						) : (
							<Input.TextArea
								value={editedDescription}
								autoSize={{ minRows: 4 }}
								onChange={(event) => setEditedDescription(event.target.value)}
							/>
						)}
					</div>

					<Divider />

					<Space style={{ marginBottom: 8 }}>
						<PaperClipOutlined />
						<Typography.Text strong>Вложения</Typography.Text>
					</Space>

					<Upload
						showUploadList={false}
						beforeUpload={(file) => {
							taskStore.addAttachment(currentTask.id, file);
							return false;
						}}
					>
						<Button icon={<FileAddOutlined />}>Добавить файл</Button>
					</Upload>

					<List
						size="small"
						style={{ marginTop: 12 }}
						dataSource={currentTask.attachments}
						locale={{ emptyText: "Файлов пока нет" }}
						renderItem={(attachment) => (
							<List.Item
								actions={[
									<Button
										key="delete"
										type="text"
										danger
										icon={<DeleteOutlined />}
										onClick={() =>
											taskStore.removeAttachment(
												currentTask.id,
												attachment.id,
											)
										}
									/>,
								]}
							>
								<List.Item.Meta
									avatar={<PaperClipOutlined />}
									title={attachment.name}
									description={formatAttachmentSize(attachment.size)}
								/>
							</List.Item>
						)}
					/>

					<Divider />

					<Button
						type="primary"
						icon={<CheckOutlined />}
						loading={isSaving}
						onClick={saveTaskChanges}
						style={{ marginRight: 8 }}
					>
						Сохранить изменения
					</Button>

					<Popconfirm
						title="Удалить задачу?"
						description="Это действие нельзя отменить."
						okText="Удалить"
						cancelText="Отмена"
						okButtonProps={{ danger: true }}
						onConfirm={handleDeleteTask}
					>
						<Button danger icon={<DeleteOutlined />}>
							Удалить задачу
						</Button>
					</Popconfirm>
				</div>
			</Drawer>
		</>
	);
});

export default TaskDetailPanel;
