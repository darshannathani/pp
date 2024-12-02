import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, Badge, Avatar, TextInput, Select, Button } from "flowbite-react";
import {
  FaUser,
  FaClock,
  FaUsers,
  FaSearch,
  FaSort,
  FaArrowLeft,
  FaCheck,
  FaTimes,
  FaComments,
} from "react-icons/fa";
import toast from "react-hot-toast";

const AppTaskReviews = () => {
  const [taskData, setTaskData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [filterTester, setFilterTester] = useState("all");
  const [actionLoading, setActionLoading] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  const fetchData = useCallback(async () => {
    const taskId = searchParams.get("taskId");
    const taskType = searchParams.get("type");

    if (!taskId || !taskType) {
      setError("Missing task information");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post("/api/task/analytics", {
        id: taskId,
        type: taskType,
      });
      setTaskData(response.data.task);
    } catch (err) {
      setError("Failed to fetch task data: " + err.message);
      toast.error("Failed to fetch task data");
    } finally {
      setLoading(false);
    }
  }, [searchParams]); // Include searchParams as a dependency

  useEffect(() => {
    fetchData();
  }, [fetchData]); // Only fetchData as dependency

  const handleBack = () => {
    router.push("/dashboard?activeTab=review-creator");
  };

  const handleResponseStatus = async (testerId, status) => {
    if (actionLoading) return;
    setActionLoading(true);

    try {
      const response = await axios.post("/api/task/app/response-status", {
        testerId: testerId,
        taskId: taskData.id,
        status: status,
      });

      if (
        response.data &&
        response.data.message === "Task response status updated successfully"
      ) {
        toast.success(
          status === "response-accepted"
            ? "Tester approved successfully"
            : "Tester disapproved successfully"
        );

        // Update the local state
        setTaskData((prevData) => ({
          ...prevData,
          answers: {
            ...prevData.answers,
            detailedResponses: prevData.answers.detailedResponses.map(
              (response) =>
                response.testerId === testerId
                  ? {
                      ...response,
                      status:
                        status === "response-accepted"
                          ? "success"
                          : "response-rejected",
                    }
                  : response
            ),
          },
        }));
      } else {
        throw new Error("Unexpected response from server");
      }
    } catch (error) {
      toast.error(
        `Failed to ${status === "response-accepted" ? "approve" : "disapprove"
        } tester: ${error.message}`
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = (testerId) =>
    handleResponseStatus(testerId, "response-accepted");
  const handleDisapprove = (testerId) =>
    handleResponseStatus(testerId, "response-rejected");

  if (loading) {
    return (
      <div className="min-h-screen p-6 space-y-8 bg-gray-50">
        <div className="w-1/4 h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="w-3/4 h-4 bg-gray-200 rounded animate-pulse"></div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, index) => (
            <Card key={index} className="animate-pulse">
              <div className="h-20 mb-4 bg-gray-200 rounded"></div>
              <div className="w-3/4 h-4 mb-2 bg-gray-200 rounded"></div>
              <div className="w-1/2 h-4 bg-gray-200 rounded"></div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-6 bg-gray-50">
        <Card className="max-w-lg mx-auto">
          <p className="text-center text-red-500">{error}</p>
        </Card>
      </div>
    );
  }

  if (!taskData) {
    return null;
  }

  const groupedResponses = taskData.answers.detailedResponses.reduce(
    (acc, response) => {
      if (!acc[response.testerId]) {
        acc[response.testerId] = [];
      }
      acc[response.testerId].push(response);
      return acc;
    },
    {}
  );

  const filteredAndSortedTesters = Object.entries(groupedResponses)
    .filter(
      ([, responses]) =>
        filterTester === "all" ||
        responses[0].testerName
          .toLowerCase()
          .includes(filterTester.toLowerCase())
    )
    .sort(([, a], [, b]) => {
      if (sortOrder === "newest") {
        return new Date(b[b.length - 1].date) - new Date(a[a.length - 1].date);
      } else {
        return new Date(a[0].date) - new Date(b[0].date);
      }
    });

  const uniqueTesters = [
    ...new Set(taskData.answers.detailedResponses.map((r) => r.testerName)),
  ];

  return (
    <div className="min-h-screen p-6 space-y-8 shadow-2xl bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl">
      <div className="flex flex-col items-start justify-between space-y-4 sm:flex-row sm:items-center sm:space-y-0">
        <Button
          color="light"
          onClick={handleBack}
          className="transition-colors duration-200 shadow-sm hover:bg-gray-200"
        >
          <FaArrowLeft className="mr-2" />
          Back to Dashboard
        </Button>
        <h1 className="text-3xl font-bold text-gray-800">{taskData.heading}</h1>
      </div>

      <Card className="p-6 shadow-lg">
        <p className="mb-4 text-lg text-gray-700">{taskData.instruction}</p>
        <div className="flex flex-wrap items-center gap-4">
          <Badge color="info" size="lg" icon={FaUsers} className="py-2">
            Total Responses: {taskData.answers.totalResponses}
          </Badge>
        </div>
      </Card>

      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
        <div className="w-full sm:w-1/2 md:w-1/3">
          <TextInput
            icon={FaSearch}
            placeholder="Search reviews..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="shadow-sm"
          />
        </div>
        <div className="flex space-x-4">
          <Select
            icon={FaSort}
            onChange={(e) => setSortOrder(e.target.value)}
            className="shadow-sm"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </Select>
          <Select
            onChange={(e) => setFilterTester(e.target.value)}
            className="shadow-sm"
          >
            <option value="all">All Testers</option>
            {uniqueTesters.map((tester) => (
              <option key={tester} value={tester}>
                {tester}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredAndSortedTesters.map(([testerId, responses]) => (
          <Card
            key={testerId}
            className="flex flex-col overflow-hidden transition-shadow duration-300 hover:shadow-xl"
          >
            <div className="flex items-start justify-between pb-4 mb-4 border-b border-gray-200">
              <div className="flex items-center space-x-4">
                <Avatar
                  rounded
                  size="lg"
                  img={`https://api.dicebear.com/6.x/initials/svg?seed=${responses[0].testerName}`}
                />
                <div>
                  <p className="text-lg font-semibold text-gray-800">
                    {responses[0].testerName}
                  </p>
                  <p className="text-sm text-gray-500">
                    {responses[0].testerEmail}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <p className="text-xs text-gray-500">
                  {responses.length} Responses
                </p>
                <p className="text-xs text-gray-500">
                  <FaClock className="inline" />{" "}
                  {new Date(responses[0].date).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex-grow mb-4 space-y-3 overflow-y-auto max-h-48">
              {responses.map((response, index) => (
                <div key={index} className="p-3 bg-gray-100 rounded-lg">
                  <p className="text-sm text-gray-700">{response.text}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    <FaClock className="inline mr-1" />
                    {new Date(response.date).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
            <div className="flex justify-end p-4 space-x-4">
              <Button
                color="success"
                onClick={() => handleApprove(testerId)}
                disabled={actionLoading}
              >
                Approve
              </Button>
              <Button
                color="failure"
                onClick={() => handleDisapprove(testerId)}
                disabled={actionLoading}
              >
                Disapprove
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AppTaskReviews;
