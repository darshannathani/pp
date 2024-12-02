import { useAppSelector } from "@/_lib/store/hooks";
import { useRouter } from "next/navigation";

export function OnGoingTaskCard({ task }) {
  const router = useRouter();
  const { role } = useAppSelector((state) => state.userInfo);
  const typeIcon = (type) => {
    switch (type.toLowerCase()) {
      case "apptask":
        return "📱";
      case "surveytask":
        return "📋";
      case "youtubetask":
        return "🎥";
      case "marketingtask":
        return "📢";
      default:
        return "❓";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleCardClick = () => {
    if (
      role === "creator" &&
      (task.type === "AppTask" || task.type === "MarketingTask")
    ) {
      router.push(
        `/dashboard?activeTab=ongoing-task&taskId=${task._id}&type=AppliedList&taskType=${task.type}`
      );
    } else if (role === "tester") {
      router.push(
        `/dashboard?activeTab=ongoing-task&taskId=${task._id}&type=${task.type}Review`
      );
    }
  };

  return (
    <div
      className="overflow-hidden transition duration-300 bg-white rounded-lg shadow-md cursor-pointer hover:shadow-lg hover:-translate-y-1"
      onClick={handleCardClick}
    >
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-600">
            {typeIcon(task.type)} {task.type.replace("Task", "")}
          </span>
          <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">
            {role === "creator" ? task.task_flag : "Submit feedback"}
          </span>
        </div>
        <h3 className="mb-2 text-lg font-semibold text-gray-800">
          {task.heading}
        </h3>
        <p className="mb-4 text-sm text-gray-600 line-clamp-2">
          {task.instruction}
        </p>
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
          <span>Start: {formatDate(task.post_date)}</span>
          <span>End: {formatDate(task.end_date)}</span>
          <span>Testers: {task.tester_no}</span>
          <span>Age: {task.tester_age}+</span>
          <span>Gender: {task.tester_gender}</span>
          <span>Country: {task.country}</span>
        </div>
      </div>
    </div>
  );
}
