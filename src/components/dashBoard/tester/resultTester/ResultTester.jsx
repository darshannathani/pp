import React, { useEffect, useState, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/_lib/store/hooks";
import axios from "axios";
import toast from "react-hot-toast";
import { addHistoryUser } from "@/_lib/store/features/shared/history/historyTesterSlice";
import Image from "next/image";
import { AiOutlineLoading } from "react-icons/ai";
import {
  Badge,
  Modal,
  Button,
  TextInput,
  Textarea,
  Select,
} from "flowbite-react";
import { FaTicketAlt, FaFilter, FaSort } from "react-icons/fa";
import { useRouter } from "next/navigation";

const TaskCard = ({ task, onRaiseTicket }) => {
  const isResponseRejected = task.status.toLowerCase() === "response-rejected";

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
          <Badge color="yellow" className="text-xs font-medium px-2.5 py-0.5">
            {task.status}
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
      {isResponseRejected && (
        <div className="px-4 py-3 bg-gradient-to-r from-yellow-50 to-orange-50">
          <Button
            color="warning"
            onClick={() => onRaiseTicket(task)}
            className="w-full"
          >
            <FaTicketAlt className="mr-2" />
            Raise Ticket
          </Button>
        </div>
      )}
    </div>
  );
};

export default function ResultTester() {
  const dispatch = useAppDispatch();
  const testerId = useAppSelector((state) => state.userInfo.id);
  const role = useAppSelector((state) => state.userInfo.role);
  const historyData = useAppSelector((state) => state.historyUser);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [ticketDescription, setTicketDescription] = useState("");

  const [sortOption, setSortOption] = useState("date");
  const [filterOption, setFilterOption] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

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
  }, [dispatch, historyData.isHistoryAvailable, testerId, role]);

  useEffect(() => {
    if (testerId) {
      fetchHistoryTasks();
    }
  }, [testerId, fetchHistoryTasks]);

  useEffect(() => {
    if (historyData.history.length > 0) {
      let filtered = historyData.history.filter(
        (task) =>
          task.type?.toLowerCase().includes("app") ||
          task.type?.toLowerCase().includes("marketing")
      );

      if (filterOption !== "all") {
        filtered = filtered.filter(
          (task) => task.status.toLowerCase() === filterOption
        );
      }

      if (searchTerm) {
        filtered = filtered.filter(
          (task) =>
            task.heading.toLowerCase().includes(searchTerm.toLowerCase()) ||
            task.instruction.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      filtered.sort((a, b) => {
        if (sortOption === "date") {
          return new Date(b.date) - new Date(a.date);
        } else if (sortOption === "status") {
          return a.status.localeCompare(b.status);
        }
        return 0;
      });

      setFilteredTasks(filtered);
    }
  }, [historyData.history, filterOption, sortOption, searchTerm]);

  const handleRaiseTicket = (task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const submitTicket = async () => {
    try {
      setIsLoading(true);
      const response = await axios.post("/api/ticket/addTicket", {
        taskId: selectedTask.id,
        testerId,
        messages: [
          {
            content: ticketDescription,
            sender: "tester",
          },
        ],
      });

      if (response.status === 200) {
        toast.success("Ticket raised successfully");
        setIsModalOpen(false);
        setTicketDescription("");
        await fetchHistoryTasks();
      } else if (response.status === 400 && response.message === "Ticket already exists") {
        router.push("/dashboard?activeTab=ticket");
        throw new Error("Ticket already Exists");
      } else {
        throw new Error("Failed to raise ticket");
      }
    } catch (error) {
      console.error("Error raising ticket:", error);
      toast.error(error.response?.data?.message || "Failed to raise ticket");
    } finally {
      setIsLoading(false);
    }
  };

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
        App and Marketing Tasks
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
            value={filterOption}
            onChange={(e) => setFilterOption(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
            <option value="response-rejected">Response Rejected</option>
            <option value="success">Success</option>
          </Select>
          <Select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
          >
            <option value="date">Sort by Date</option>
            <option value="status">Sort by Status</option>
          </Select>
        </div>
      </div>

      {filteredTasks.length === 0 ? (
        <div className="flex flex-col items-center">
          <Image
            src="/images/NoData.png"
            alt="No Data Available"
            width={400}
            height={300}
            className="mb-4"
          />
          <p className="text-lg text-gray-600">No tasks found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onRaiseTicket={handleRaiseTicket}
            />
          ))}
        </div>
      )}

      <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <Modal.Header>Raise a Ticket</Modal.Header>
        <Modal.Body>
          <div className="space-y-6">
            <h3 className="text-xl font-medium text-gray-900 dark:text-white">
              Task: {selectedTask?.heading}
            </h3>
            <Textarea
              placeholder="Describe your issue..."
              rows={4}
              value={ticketDescription}
              onChange={(e) => setTicketDescription(e.target.value)}
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            color="gray"
            onClick={() => setIsModalOpen(false)}
          >
            Cancel
          </Button>
          <Button
            color="green"
            onClick={submitTicket}
            disabled={isLoading}
          >
            Submit
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
