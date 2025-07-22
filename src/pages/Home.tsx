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
			<Split
				sizes={selectedTask ? [60, 40] : [100, 0]}
				minSize={300}
				expandToMin={false}
				gutterSize={6}
				snapOffset={0}
				direction="horizontal"
				style={{ display: "flex", height: "calc(100vh - 64px)" }}
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

				{selectedTask ? (
					<div
						style={{
							background: "#fff",
							borderLeft: "1px solid #eee",
							boxShadow: "-6px 0 20px rgba(0,0,0,0.1)",
							overflowY: "auto",
						}}
					>
						<TaskDetailPanel
							task={selectedTask}
							onClose={() => setSelectedTask(null)}
						/>
					</div>
				) : (
					<div />
				)}
			</Split>
		</PageLayout>
	);
});

export default Home;
