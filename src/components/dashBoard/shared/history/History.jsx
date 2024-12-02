import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/_lib/store/hooks";
import axios from "axios";
import toast from "react-hot-toast";
import { HistoryCard } from "./HistoryCard";
import { addHistoryUser } from "@/_lib/store/features/shared/history/historyTesterSlice";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { AiOutlineLoading } from "react-icons/ai";

export default function HistoryUser() {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("activeTab");
  const dispatch = useAppDispatch();
  const testerId = useAppSelector((state) => state.userInfo.id);
  const role = useAppSelector((state) => state.userInfo.role);
  const historyData = useAppSelector((state) => state.historyUser);

  const [isLoading, setIsLoading] = useState(true);
  const [isFiltering, setIsFiltering] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [taskTypeFilter, setTaskTypeFilter] = useState("all");
  const [sortOption, setSortOption] = useState("date");

  useEffect(() => {
    const fetchHistoryTasks = async () => {
      try {
        if (!historyData.isHistoryAvailable && testerId) {
          const response = await axios.post("/api/task/history", {
            id: testerId,
            role,
          });

          if (response.status === 200) {
            const { history } = response.data;
            dispatch(addHistoryUser(history));
          }
        }
      } catch (error) {
        console.error(
          "Error fetching history tasks:",
          error.response ? error.response.data : error.message
        );
        toast.error("Failed to fetch history");
      } finally {
        setIsLoading(false);
      }
    };

    if (testerId) {
      setTimeout(() => {
        fetchHistoryTasks();
      }, 1500);
    }
  }, [testerId, dispatch, role, historyData.isHistoryAvailable]);

  const filteredTasks = historyData.history
    .filter((task) => {
      if (activeTab === "analytics") {
        return (
          task.status?.toLowerCase() === "closed" &&
          !task.type?.toLowerCase().includes("app") &&
          !task.type?.toLowerCase().includes("marketing")
        );
      } else if (activeTab === "review-creator") {
        return (
          task.type?.toLowerCase().includes("app") ||
          task.type?.toLowerCase().includes("marketing")
        );
      }
      return true;
    })
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
    })
    .sort((a, b) => {
      if (sortOption === "date") {
        return new Date(b.date) - new Date(a.date);
      } else if (sortOption === "status") {
        return a.status.localeCompare(b.status);
      }
      return 0;
    });

  useEffect(() => {
    if (isFiltering) {
      const timer = setTimeout(() => {
        setIsFiltering(false);
      }, 500);
      return () => clearTimeout(timer); // Cleanup timer on unmount
    }
  }, [isFiltering]);

  if (isLoading) {
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

  return (
    <div className="p-8 shadow-2xl bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl">
      <h2 className="mb-8 text-3xl font-extrabold text-center text-gray-800">
        {activeTab === "analytics"
          ? "Analytics"
          : activeTab === "review-creator"
          ? "Reviews"
          : "Task History"}
      </h2>

      <div className="flex flex-col mb-6 space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 md:space-x-4">
        <input
          type="text"
          placeholder="Search tasks..."
          className="flex-grow p-2 border border-gray-300 rounded-md"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsFiltering(true);
          }}
        />
        <div className="flex space-x-2">
          <select
            className="p-2 border border-gray-300 rounded-md"
            value={taskTypeFilter}
            onChange={(e) => {
              setTaskTypeFilter(e.target.value);
              setIsFiltering(true);
            }}
          >
            <option value="all">All Types</option>
            <option value="survey">Survey</option>
            <option value="youtube">YouTube</option>
            <option value="app">App</option>
            <option value="marketing">Marketing</option>
          </select>
          <select
            className="p-2 border border-gray-300 rounded-md"
            value={sortOption}
            onChange={(e) => {
              setSortOption(e.target.value);
              setIsFiltering(true);
            }}
          >
            <option value="date">Sort by Date</option>
            <option value="status">Sort by Status</option>
          </select>
        </div>
      </div>

      {isFiltering ? (
        <div className="flex items-center justify-center py-10">
          <AiOutlineLoading className="text-4xl text-blue-600 animate-spin" />
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="flex flex-col items-center">
          <Image
            src="/images/NoData.png"
            alt="No Data Available"
            width={400}
            height={300}
            className="mb-4"
          />
          <p className="text-lg text-gray-600">No history available.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTasks.map((task, index) => (
            <HistoryCard key={index} task={task} />
          ))}
        </div>
      )}
    </div>
  );
}
