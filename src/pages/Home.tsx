import { Card, Empty, Typography } from "antd";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import type { Task } from "../store/TaskStore";
import projectStore from "../store/ProjectStore";
import PageLayout from "../components/PageLayout";
import TaskBoard from "../components/TaskBoard";
import TaskDetailPanel from "../components/TaskDetailPanel";
import ProjectDetailPanel from "../components/ProjectDetailPanel";

const Home = observer(() => {
	const [selectedTask, setSelectedTask] = useState<Task | null>(null);
	const [selectedProjectPanel, setSelectedProjectPanel] = useState<string | null>(null);
	const [activeMenuKey, setActiveMenuKey] = useState("all-tasks");

	const closeTaskPanel = () => setSelectedTask(null);
	const closeProjectPanel = () => setSelectedProjectPanel(null);

	const renderProjectsView = () => {
		if (!projectStore.projects.length) {
			return <Empty description="Проектов пока нет" />;
		}

		return (
			<div>
				<Typography.Title level={4}>Все проекты</Typography.Title>

				<div style={{ display: "grid", gap: 12 }}>
					{projectStore.projects.map((project) => (
						<Card
							key={project}
							hoverable
							style={{ cursor: "pointer" }}
							onClick={() => {
								projectStore.selectProject(project);
								setSelectedTask(null);
								setSelectedProjectPanel(project);
							}}
						>
							{project}
						</Card>
					))}
				</div>
			</div>
		);
	};

	const renderTasksView = () => {
		return (
			<TaskBoard
				onTaskClick={(task) => {
					setSelectedProjectPanel(null);
					setSelectedTask(task);
				}}
			/>
		);
	};

	return (
		<PageLayout
			headerLeft={
				<Typography.Title level={4} style={{ margin: 0 }}>
					{activeMenuKey === "all-projects" ? "Все проекты" : "Все задачи"}
				</Typography.Title>
			}
			activeMenuKey={activeMenuKey}
			onMenuSelect={(key) => {
				setActiveMenuKey(key);
				setSelectedProjectPanel(null);
			}}
		>
			{activeMenuKey === "all-projects" ? renderProjectsView() : renderTasksView()}

			<TaskDetailPanel task={selectedTask} onClose={closeTaskPanel} />

			<ProjectDetailPanel
				projectName={selectedProjectPanel}
				onClose={closeProjectPanel}
			/>
		</PageLayout>
	);
});

export default Home;