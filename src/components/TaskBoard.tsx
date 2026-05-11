import { Input, Card, Empty } from "antd";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import {
	DragDropContext,
	Droppable,
	Draggable,
	type DropResult,
} from "react-beautiful-dnd";

import taskStore, { type ColumnType, type Task } from "../store/TaskStore";
import projectStore from "../store/ProjectStore";

interface TaskBoardProps {
	onTaskClick?: (task: Task) => void;
}

const TaskBoard = observer(({ onTaskClick }: TaskBoardProps) => {
	const selectedProject = projectStore.selectedProject;

	useEffect(() => {
		if (selectedProject) {
			taskStore.initProject(selectedProject);
		}
	}, [selectedProject]);

	const onDragEnd = (result: DropResult) => {
		const { source, destination } = result;
		if (!destination) return;

		taskStore.moveTask(
			source.droppableId as ColumnType,
			destination.droppableId as ColumnType,
			source.index,
			destination.index,
		);
	};

	if (!selectedProject) {
		return (
			<Empty
				description="Выберите проект слева"
				style={{ marginTop: 100 }}
			/>
		);
	}

	const columns = taskStore.columns;

	return (
		<DragDropContext onDragEnd={onDragEnd}>
			<div
				style={{
					display: "flex",
					gap: 16,
					overflowX: "auto",
					padding: 16,
					height: "100%",
				}}
			>
				{Object.entries(columns).map(([key, tasks]) => (
					<Card
						key={key}
						title={taskStore.getColumnTitle(key as ColumnType)}
						style={{
							flex: 1,
							minWidth: 250,
							display: "flex",
							flexDirection: "column",
							maxHeight: "calc(100vh - 160px)",
						}}
						styles={{
							body: {
								flex: 1,
								display: "flex",
								flexDirection: "column",
								overflow: "hidden",
							},
						}}
					>
						{key === "open" && (
							<Input
								placeholder="Новая задача"
								value={taskStore.newTaskTitle}
								onChange={(e) =>
									taskStore.setNewTaskTitle(e.target.value)
								}
								onPressEnter={() =>
									taskStore.addTask(key as ColumnType)
								}
								style={{ marginBottom: 12 }}
							/>
						)}

						<Droppable
							droppableId={key}
							direction="vertical"
						>
							{(provided) => (
								<div
									ref={provided.innerRef}
									{...provided.droppableProps}
									style={{
										flex: 1,
										overflowY: "auto",
										display: "flex",
										flexDirection: "column",
										gap: 12,
										scrollbarWidth: "none",
										msOverflowStyle: "none",
									}}
								>
									{tasks.map((task, index) => (
										<Draggable
											key={task.id}
											draggableId={task.id}
											index={index}
										>
											{(provided) => (
												<div
													ref={provided.innerRef}
													{...provided.draggableProps}
													{...provided.dragHandleProps}
													style={{
														...provided
															.draggableProps
															.style,
														transition:
															"transform 0.2s ease",
													}}
												>
													<Card
														style={{
															height: 80,
															display: "flex",
															alignItems:
																"center",
															justifyContent:
																"center",
															cursor: "pointer",
														}}
														onClick={() =>
															onTaskClick?.(task)
														}
													>
														{task.title}
													</Card>
												</div>
											)}
										</Draggable>
									))}
									{provided.placeholder}
								</div>
							)}
						</Droppable>
					</Card>
				))}
			</div>
		</DragDropContext>
	);
});

export default TaskBoard;
