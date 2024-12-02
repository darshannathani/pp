import React, { useState, useEffect } from "react";
import axios from "axios";
import { OnGoingTaskCard } from "./OnGoingTaskCard";
import { useAppSelector } from "@/_lib/store/hooks";
import Image from "next/image";

export default function OnGoingTask() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [taskTypeFilter, setTaskTypeFilter] = useState("all");
  const [sortOption, setSortOption] = useState("date");

  const { id, role } = useAppSelector((state) => state.userInfo);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const response = await axios.post("/api/task/ongoing", {
          id,
          role,
        });
        setTasks(response.data.tasks || []);
        setError(null);
      } catch (err) {
        console.error("Error fetching ongoing tasks:", err);
        if (err.response && err.response.status === 404) {
          setTasks([]);
        } else {
          setError("Failed to fetch ongoing tasks");
        }
      } finally {
        setLoading(false);
      }
    };

    if (id && role) {
      fetchTasks();
    }
  }, [id, role]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleTaskTypeFilter = (e) => {
    setTaskTypeFilter(e.target.value);
  };

  const filteredTasks = tasks
    .filter((task) => {
      if (taskTypeFilter !== "all") {
        const normalizedTaskType = task.type?.toLowerCase();
        const normalizedFilter = taskTypeFilter.toLowerCase();

        return (
          (normalizedTaskType.includes("app") && normalizedFilter === "app") ||
          (normalizedTaskType.includes("youtube") &&
            normalizedFilter === "youtube") ||
          (normalizedTaskType.includes("survey") &&
            normalizedFilter === "survey") ||
          (normalizedTaskType.includes("marketing") &&
            normalizedFilter === "marketing")
        );
      }
      return true;
    })
    .filter((task) => {
      const heading = task.heading?.toLowerCase() || "";
      const instruction = task.instruction?.toLowerCase() || "";
      return (
        heading.includes(searchTerm.toLowerCase()) ||
        instruction.includes(searchTerm.toLowerCase())
      );
    });

  const NoDataDisplay = () => (
    <div className="flex flex-col items-center justify-center py-10">
      <Image
        src="/images/NoData.png"
        alt="No Data Available"
        width={400}
        height={300}
        className="mb-4"
      />
      <p className="text-xl font-semibold text-gray-600">
        No ongoing tasks found
      </p>
    </div>
  );

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 p-8 sm:grid-cols-2 lg:grid-cols-3">
        {Array(6)
          .fill("")
          .map((_, index) => (
            <div
              key={index}
              className="h-64 bg-gray-200 animate-pulse rounded-xl"
            ></div>
          ))}
      </div>
    );
  }

  if (error) {
    return <div className="py-10 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="p-8 shadow-2xl bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl">
      <h2 className="mb-8 text-3xl font-extrabold text-center text-gray-800">
        Ongoing Tasks
      </h2>
      {tasks.length === 0 ? (
        <NoDataDisplay />
      ) : (
        <>
          <div className="flex flex-col mb-6 space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 md:space-x-4">
            <input
              type="text"
              placeholder="Search tasks..."
              className="flex-grow p-2 border border-gray-300 rounded-md"
              value={searchTerm}
              onChange={handleSearch}
            />
            <div className="flex space-x-2">
              <select
                className="p-2 border border-gray-300 rounded-md"
                value={taskTypeFilter}
                onChange={handleTaskTypeFilter}
              >
                <option value="all">All Types</option>
                <option value="survey">Survey</option>
                <option value="youtube">YouTube</option>
                <option value="app">App</option>
                <option value="marketing">Marketing</option>
              </select>
            </div>
          </div>
          {filteredTasks.length === 0 ? (
            <NoDataDisplay />
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredTasks.map((task) => (
                <OnGoingTaskCard key={task._id} task={task} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
