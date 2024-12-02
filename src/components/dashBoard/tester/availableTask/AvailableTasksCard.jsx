import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Badge } from "flowbite-react";
import Image from "next/image";
import { useAppDispatch, useAppSelector } from "@/_lib/store/hooks";
import toast from "react-hot-toast";
import { clearAvailableTask } from "@/_lib/store/features/tester/availableTask/availableTaskSlice";
import axios from "axios";
import { clearHistoryUser } from "@/_lib/store/features/shared/history/historyTesterSlice";

const SkeletonLoader = () => (
  <Card className="w-full h-48 animate-pulse">
    <div className="h-full bg-gray-200 rounded-lg"></div>
  </Card>
);

function TaskCard({ task }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const testerId = useAppSelector((state) => state.userInfo?.id);

  const handleRedirect = async () => {
    const { type, _id } = task;

    if (type === "AppTask" || type === "MarketingTask") {
      try {
        const endpoint =
          type === "AppTask"
            ? "/api/task/app/apply"
            : "/api/task/marketing/apply-task";
        const response = await axios.post(endpoint, { testerId, taskId: _id });

        if (response.status === 200) {
          dispatch(clearAvailableTask());
          dispatch(clearHistoryUser());
          toast.success("Task submitted successfully!");
          router.push("/dashboard?activeTab=applied-task");
        } else {
          toast.error(response?.data?.message || "An error occurred.");
        }
      } catch (error) {
        toast.error("An error occurred.");
      }
    } else {
      router.push(
        `/dashboard?activeTab=available-task&taskId=${_id}&type=${type}`
      );
    }
  };

  const getTaskTypeBadge = (type) => {
    const badgeColors = {
      SurveyTask: "info",
      YoutubeTask: "warning",
      AppTask: "success",
      MarketingTask: "dark",
    };

    return (
      <Badge color={badgeColors[type] || "default"} className="ml-2">
        {type.replace("Task", "")}
      </Badge>
    );
  };

  return (
    <Card className="w-full transition-shadow duration-300 hover:shadow-lg">
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-2">
          <h5 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
            {task.heading}
            {getTaskTypeBadge(task.type)}
          </h5>
        </div>
        <p className="flex-grow mb-3 font-normal text-gray-700 dark:text-gray-400">
          {task.instruction.slice(0, 100) + "..."}
        </p>
        <div className="flex items-center mb-4 space-x-4 text-sm text-gray-600">
          <span className="flex items-center">
            📅 {new Date(task.end_date).toLocaleDateString()}
          </span>
          <span className="flex items-center">
            👥 {task.tester_gender}, {task.tester_age}+
          </span>
        </div>
        <Button color="blue" onClick={handleRedirect} className="w-full">
          Apply
        </Button>
      </div>
    </Card>
  );
}

export default function AvailableTasksCard() {
  const availableTaskData = useAppSelector((state) => state.availableTask);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("date");
  const [sortOrder, setSortOrder] = useState("asc");
  const [typeFilter, setTypeFilter] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value.toLowerCase());
  };

  const handleSortChange = () => {
    setSortOrder((prevOrder) => (prevOrder === "asc" ? "desc" : "asc"));
  };

  const handleTypeFilterChange = (event) => {
    setTypeFilter(event.target.value);
  };

  const filterTasks = (tasks) => {
    return tasks.filter(
      (task) =>
        (task.heading.toLowerCase().includes(searchTerm) ||
          task.instruction.toLowerCase().includes(searchTerm)) &&
        (typeFilter === "" || task.type === typeFilter)
    );
  };

  const sortTasks = (tasks) => {
    return tasks.sort((a, b) => {
      const dateA = new Date(a.end_date);
      const dateB = new Date(b.end_date);
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });
  };

  useEffect(() => {
    const applyFiltersAndSorting = async () => {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
      }, 500);
    };

    applyFiltersAndSorting();
  }, [searchTerm, sortOption, sortOrder, typeFilter]);

  const availableTasks = [
    ...(availableTaskData?.surveys || []),
    ...(availableTaskData?.youtube || []),
    ...(availableTaskData?.app || []),
    ...(availableTaskData?.marketingTask || []),
  ];

  const filteredTasks = filterTasks(availableTasks);
  const sortedTasks = sortTasks(filteredTasks);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="Search tasks..."
            className="w-full py-2 pl-10 pr-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={handleSearch}
          />
          <span className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2">
            🔍
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <select
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={typeFilter}
            onChange={handleTypeFilterChange}
          >
            <option value="">All Types</option>
            <option value="SurveyTask">Surveys</option>
            <option value="YouTubeTask">YouTube</option>
            <option value="AppTask">App</option>
            <option value="MarketingTask">Marketing</option>
          </select>
          <Button
            color="light"
            onClick={handleSortChange}
            className="flex items-center"
          >
            <span className="mr-2">⇅</span>
            {sortOrder === "asc" ? "Oldest" : "Newest"}
          </Button>
        </div>
      </div>
      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <SkeletonLoader key={index} />
          ))}
        </div>
      ) : sortedTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64">
          <Image
            src="/images/NoData.png"
            alt="No Data Available"
            width={200}
            height={200}
            className="mb-4"
          />
          <p className="text-lg text-gray-600">No tasks available.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sortedTasks.map((task) => (
            <TaskCard key={task._id} task={task} />
          ))}
        </div>
      )}
    </div>
  );
}
