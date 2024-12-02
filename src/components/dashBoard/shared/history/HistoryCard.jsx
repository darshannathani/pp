import React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Badge } from "flowbite-react";
import { FaChartBar, FaEdit } from "react-icons/fa";

export function HistoryCard({ task }) {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("activeTab");
  const router = useRouter();

  const handleClick = () => {
    if (activeTab === "analytics") {
      const url = `/dashboard?activeTab=analytics&id=${task?.id}&type=${task?.type}`;
      router.push(url);
    } else if (activeTab === "review-creator") {
      const url = `?activeTab=review-creator&taskId=${task.id}&type=${task.type}`;
      router.push(url);
    }
  };

  const statusColor = (status) => {
    switch (status.toLowerCase()) {
      case "applied":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "success":
        return "bg-green-100 text-green-800";
      case "inreview":
        return "bg-purple-100 text-purple-800";
      case "response-rejected":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const typeIcon = (type) => {
    switch (type.toLowerCase()) {
      case "surveytask":
        return "📋";
      case "youtubetask":
        return "🎥";
      case "apptask":
        return "📱";
      case "marketingtask":
        return "📢";
      default:
        return "❓";
    }
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-md overflow-hidden transition duration-300 ${
        activeTab === "analytics" || activeTab === "review-creator"
          ? "cursor-pointer hover:shadow-lg hover:-translate-y-1"
          : ""
      }`}
      onClick={handleClick}
    >
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <Badge color="indigo" icon={FaEdit} className="px-2.5 py-0.5">
            {typeIcon(task?.type)} {task?.type.replace("Task", "")}
          </Badge>
          <Badge
            color="light"
            className={`px-2.5 py-0.5 ${statusColor(task?.status)}`}
          >
            {task?.status}
          </Badge>
        </div>
        <h3 className="mb-2 text-lg font-semibold text-gray-800 line-clamp-2">
          {task?.heading}
        </h3>
        <p className="mb-4 text-sm text-gray-600 line-clamp-3">
          {task?.instruction}
        </p>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className="font-medium">ID: {task?.id.slice(0, 8)}...</span>
          <span>{new Date(task?.date).toLocaleDateString()}</span>
        </div>
      </div>
      {(activeTab === "analytics" || activeTab === "review-creator") && (
        <div className="p-3 text-center transition-colors duration-300 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100">
          <span className="flex items-center justify-center text-sm font-medium text-indigo-600">
            {activeTab === "analytics" ? (
              <>
                <FaChartBar className="mr-2" /> View Analytics
              </>
            ) : (
              <>
                <FaEdit className="mr-2" /> Review Responses
              </>
            )}
          </span>
        </div>
      )}
    </div>
  );
}