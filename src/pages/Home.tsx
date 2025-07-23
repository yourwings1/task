import Split from "react-split";
import { Typography, Empty } from "antd";
import type { FC } from "react";
import TaskBoard from "../components/TaskBoard";
import PageLayout from "../components/PageLayout";
import projectStore from "../store/ProjectStore";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import type { Task } from "../store/TaskStore";
import TaskDetailPanel from "../components/TaskDetailPanel";

const { Title } = Typography;

const Home: FC = observer(() => {
	const selected = projectStore.selectedProject;
	const [selectedTask, setSelectedTask] = useState<Task | null>(null);

	return (
		<PageLayout
			headerLeft={
				<Title
					level={5}
					style={{ margin: 0, color: selected ? "#000" : "#aaa" }}
				>
					{selected || "Выберите проект"}
				</Title>
			}
		>
			<div style={{ overflow: "auto" }}>
				{selected ? (
					<TaskBoard onTaskClick={setSelectedTask} />
				) : (
					<div
						style={{
							padding: 48,
							textAlign: "center",
							color: "#999",
						}}
					>
						<Empty
							description="Слева выберите или создайте проект"
							imageStyle={{ height: 120 }}
						/>
					</div>
				)}
			</div>

			{selectedTask && (
				<TaskDetailPanel
					task={selectedTask}
					onClose={() => setSelectedTask(null)}
				/>
			)}
		</PageLayout>
	);
});

export default Home;
