import React, { useEffect, useState, useCallback } from "react"; // Add useCallback
import { useAppDispatch, useAppSelector } from "@/_lib/store/hooks";
import axios from "axios";
import toast from "react-hot-toast";
import { addHistoryUser } from "@/_lib/store/features/shared/history/historyTesterSlice";
import Image from "next/image";
import { AiOutlineLoading } from "react-icons/ai";
import { Badge, Button, TextInput, Select } from "flowbite-react";
import { FaFilter, FaSort, FaHourglassHalf } from "react-icons/fa";

const TaskCard = ({ task }) => {
  return (
    <div className="overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <Badge
            color={task.type.toLowerCase() === "app" ? "indigo" : "purple"}
            className="text-xs font-medium px-2.5 py-0.5"
          >
            {task.type}
          </Badge>
          <Badge color="blue" className="text-xs font-medium px-2.5 py-0.5">
            Applied
          </Badge>
        </div>
        <h3 className="mb-2 text-lg font-semibold text-gray-800">
          {task.heading}
        </h3>
        <p className="mb-4 text-sm text-gray-600 line-clamp-2">
          {task.instruction}
        </p>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{task.testerInfo}</span>
          <span>{task.date}</span>
        </div>
      </div>
      <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50">
        <Button color="light" className="w-full">
          <FaHourglassHalf className="mr-2" />
          Awaiting Response
        </Button>
      </div>
    </div>
  );
};

export default function AppliedTask() {
  const dispatch = useAppDispatch();
  const testerId = useAppSelector((state) => state.userInfo.id);
  const role = useAppSelector((state) => state.userInfo.role);
  const historyData = useAppSelector((state) => state.historyUser);

  const [isLoading, setIsLoading] = useState(true);
  const [appliedTasks, setAppliedTasks] = useState([]);
  const [sortOption, setSortOption] = useState("date");
  const [searchTerm, setSearchTerm] = useState("");

  // Use useCallback to memoize the fetchHistoryTasks function
  const fetchHistoryTasks = useCallback(async () => {
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
  }, [dispatch, historyData.isHistoryAvailable, role, testerId]); // Add dependencies

  useEffect(() => {
    if (testerId) {
      fetchHistoryTasks();
    }
  }, [testerId, fetchHistoryTasks]); // Include fetchHistoryTasks in dependencies

  useEffect(() => {
    if (historyData.history.length > 0) {
      let filtered = historyData.history.filter(
        (task) =>
          (task.type?.toLowerCase().includes("app") ||
            task.type?.toLowerCase().includes("marketing")) &&
          task.status.toLowerCase() === "applied"
      );

      // Apply search term filter
      if (searchTerm) {
        filtered = filtered.filter(
          (task) =>
            task.heading.toLowerCase().includes(searchTerm.toLowerCase()) ||
            task.instruction.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Apply sorting
      filtered.sort((a, b) => {
        if (sortOption === "date") {
          return new Date(b.date) - new Date(a.date);
        } else if (sortOption === "type") {
          return a.type.localeCompare(b.type);
        }
        return 0;
      });

      setAppliedTasks(filtered);
    }
  }, [historyData.history, sortOption, searchTerm]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <AiOutlineLoading className="text-4xl text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container p-6 mx-auto shadow-2xl bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl">
      <h2 className="mb-6 text-2xl font-bold text-gray-800">
        Applied App and Marketing Tasks
      </h2>

      <div className="flex flex-col mb-6 space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 md:space-x-4">
        <TextInput
          type="text"
          placeholder="Search tasks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon={FaFilter}
        />
        <div className="flex space-x-2">
          <Select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
          >
            <option value="date">Sort by Date</option>
            <option value="type">Sort by Type</option>
          </Select>
        </div>
      </div>

      {appliedTasks.length === 0 ? (
        <div className="flex flex-col items-center">
          <Image
            src="/images/NoData.png"
            alt="No Data Available"
            width={400}
            height={300}
            className="mb-4"
          />
          <p className="text-lg text-gray-600">No applied tasks found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {appliedTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  );
}
