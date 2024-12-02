import React, { useState, useEffect, useCallback } from "react"; // Import useCallback
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  Badge,
  TextInput,
  Select,
  Button,
  Avatar,
  Modal,
} from "flowbite-react";
import {
  FaUsers,
  FaSearch,
  FaSort,
  FaArrowLeft,
  FaClock,
  FaShoppingCart,
  FaLink,
  FaCheck,
  FaTimes,
} from "react-icons/fa";
import { CldImage } from "next-cloudinary";
import toast from "react-hot-toast";

const ReviewCard = ({ response, handleApprove, handleDisapprove }) => {
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  return (
    <>
      <Card className="overflow-hidden">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Avatar rounded size="md" />
            <div>
              <p className="text-lg font-bold">{response.testerName}</p>
              <p className="text-sm text-gray-600">
                <FaShoppingCart className="inline mr-1" />
                Order ID: {response.orderId}
              </p>
              <p className="text-sm text-gray-600">
                <FaClock className="inline mr-1" />
                Ordered: {new Date(response.orderDate).toLocaleDateString()}
              </p>
            </div>
          </div>
          <a
            href={response.reviewLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-blue-600 hover:underline"
          >
            <FaLink className="mr-1" />
            Review
          </a>
        </div>

        {response.reviewImage && (
          <div
            className="mb-4 cursor-pointer"
            onClick={() => setIsImageModalOpen(true)}
          >
            <CldImage
              width="600"
              height="400"
              src={response.reviewImage}
              alt="Review Image"
              className="w-full h-auto rounded-md"
            />
          </div>
        )}

        <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            <FaClock className="inline mr-1" />
            Submitted: {new Date(response.submittedAt).toLocaleString()}
          </p>
        </div>
        <div className="flex mt-2 space-x-2">
          <Button
            color="success"
            size="sm"
            onClick={() => handleApprove(response.testerId)}
            disabled={response.status === "approved"}
          >
            <FaCheck className="mr-1" />
            {response.status === "approved" ? "Approved" : "Approve"}
          </Button>
          <Button
            color="failure"
            size="sm"
            onClick={() => handleDisapprove(response.testerId)}
            disabled={response.status === "disapproved"}
          >
            <FaTimes className="mr-1" />
            {response.status === "disapproved" ? "Disapproved" : "Disapprove"}
          </Button>
        </div>
      </Card>

      <Modal
        show={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        size="xl"
      >
        <Modal.Header>Review Image</Modal.Header>
        <Modal.Body>
          <div className="flex justify-center">
            <CldImage
              width="800"
              height="600"
              src={response.reviewImage}
              alt="Review Image"
              className="h-auto max-w-full rounded-md"
            />
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

const MarketingTaskReviews = () => {
  const [taskData, setTaskData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [actionLoading, setActionLoading] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  // Use useCallback to memoize fetchData
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
  }, [searchParams]);

  useEffect(() => {
    fetchData();
  }, [fetchData]); // Include fetchData as a dependency

  const handleBack = () => {
    router.push("/dashboard?activeTab=review-creator");
  };

  const handleResponseStatus = async (testerId, status) => {
    if (actionLoading) return;
    setActionLoading(true);

    try {
      const response = await axios.post("/api/task/marketing/response-status", {
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
            ? "Response approved successfully"
            : "Response disapproved successfully"
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
                        ? "approved"
                        : "disapproved",
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
        } response: ${error.message}`
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
      <div className="p-8 space-y-4">
        <div className="h-12 bg-gray-200 rounded-md animate-pulse"></div>
        <div className="w-1/2 h-4 bg-gray-200 rounded-md animate-pulse"></div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-40 bg-gray-200 rounded-md animate-pulse"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="m-8">
        <p className="text-center text-red-500">{error}</p>
      </Card>
    );
  }

  if (!taskData) {
    return null;
  }

  const filteredAndSortedResponses = taskData.answers.detailedResponses
    .filter(
      (response) =>
        response.reviewLink.toLowerCase().includes(searchTerm.toLowerCase()) ||
        response.testerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        response.orderId.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortOrder === "newest") {
        return new Date(b.submittedAt) - new Date(a.submittedAt);
      } else {
        return new Date(a.submittedAt) - new Date(b.submittedAt);
      }
    });

  return (
    <div className="p-8 space-y-8 shadow-2xl bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Task Reviews</h1>
        <Button onClick={handleBack}>
          <FaArrowLeft className="mr-1" />
          Back
        </Button>
      </div>

      <TextInput
        placeholder="Search by Tester Name or Order ID..."
        onChange={(e) => setSearchTerm(e.target.value)}
        value={searchTerm}
      />

      <Select
        value={sortOrder}
        onChange={(e) => setSortOrder(e.target.value)}
        className="w-48"
      >
        <option value="newest">Sort by Newest</option>
        <option value="oldest">Sort by Oldest</option>
      </Select>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredAndSortedResponses.map((response) => (
          <ReviewCard
            key={response.testerId}
            response={response}
            handleApprove={handleApprove}
            handleDisapprove={handleDisapprove}
          />
        ))}
      </div>
    </div>
  );
};

export default MarketingTaskReviews;
