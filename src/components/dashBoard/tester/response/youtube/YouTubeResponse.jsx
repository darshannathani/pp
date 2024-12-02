import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Modal } from "flowbite-react";
import { CldImage } from "next-cloudinary";
import { useAppDispatch, useAppSelector } from "@/_lib/store/hooks";
import { clearResponseTask } from "@/_lib/store/features/tester/responseTask/responseTaskSlice";
import { clearAvailableTask } from "@/_lib/store/features/tester/availableTask/availableTaskSlice";
import toast from "react-hot-toast";
import axios from "axios";
import { clearHistoryUser } from "@/_lib/store/features/shared/history/historyTesterSlice";

export default function YouTubeResponse() {
  const searchParams = useSearchParams();
  const taskId = searchParams.get("taskId");
  const type = searchParams.get("type");
  const dispatch = useAppDispatch();
  const router = useRouter();

  // Define a mapping between task types and store keys
  const taskMapping = {
    SurveyTask: "surveys",
    YoutubeTask: "youtube",
    AppTask: "app"
  };

  // Get the corresponding tasks from the store based on type
  const taskInfo = useAppSelector((state) => {
    const storeKey = taskMapping[type]; // Map type to store key
    return state.availableTask[storeKey].find((task) => task._id === taskId)?.specificTaskDetails; // Fetch the specific task
  });
  const youtubeThumbnails = taskInfo?.youtube_thumbnails || [];
  const testerId = useAppSelector((state) => state.userInfo?.id);

  const [selectedThumbnailId, setSelectedThumbnailId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalThumbnail, setModalThumbnail] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const handleSubmitTask = async () => {
    setIsSubmitting(true);
    try {
      const selectedThumbnail = youtubeThumbnails.find(
        (thumbnail) => thumbnail._id === selectedThumbnailId
      );
      const taskSubmission = {
        taskId,
        testerId,
        response: selectedThumbnail?.title || "No response selected",
      };
      const response = await axios.post(
        "/api/task/youtube/taskResponse",
        taskSubmission
      );
      if (response.status === 201) {
        dispatch(clearResponseTask());
        dispatch(clearAvailableTask());
        dispatch(clearHistoryUser());
        toast.success("Task submitted successfully!");
        router.push("/dashboard?activeTab=history");
      }
    } catch (error) {
      console.error("Error Submitting task:", error.response?.data || error.message);
      toast.error("Failed to submit task.");
    } finally {
      setIsSubmitting(false);
      setIsConfirmModalOpen(false);
    }
  };

  const handleThumbnailSelect = (thumbnailId) => setSelectedThumbnailId(thumbnailId);
  const handleThumbnailClick = (thumbnail) => {
    setModalThumbnail(thumbnail);
    setIsModalOpen(true);
  };
  const handleModalClose = () => {
    setIsModalOpen(false);
    setModalThumbnail(null);
  };
  const openConfirmModal = () => setIsConfirmModalOpen(true);
  const closeConfirmModal = () => setIsConfirmModalOpen(false);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gray-100">
      <div className="w-full max-w-4xl p-8 bg-white rounded-lg shadow-lg">
        <h2 className="mb-6 text-3xl font-bold text-center text-gray-800">
          Select the Most Eye-Catching Thumbnail
        </h2>

        {/* "Go to Task Selection" Button */}
        <div className="mb-6 text-center">
          <Button
            color="gray"
            onClick={() => router.push("/dashboard?activeTab=available-task")}
            className="px-6 py-2 text-lg font-semibold text-white bg-gray-600 rounded-lg hover:bg-gray-700"
          >
            Go to Task Selection
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {youtubeThumbnails.map((thumbnail) => (
            <div
              key={thumbnail._id}
              className={`relative overflow-hidden rounded-lg shadow-md transition-all duration-300 transform hover:scale-105 ${
                selectedThumbnailId === thumbnail._id
                  ? "ring-4 ring-blue-500"
                  : ""
              }`}
              onClick={() => handleThumbnailSelect(thumbnail._id)}
            >
              <CldImage
                width="400"
                height="300"
                src={thumbnail.title}
                alt={`Thumbnail ${thumbnail._id}`}
                className="object-cover w-full h-auto cursor-pointer"
                onClick={() => handleThumbnailClick(thumbnail)}
              />
              {selectedThumbnailId === thumbnail._id && (
                <div className="absolute inset-0 flex items-center justify-center bg-blue-500 bg-opacity-20">
                  <span className="p-2 text-white bg-blue-600 rounded-full">
                    ✓
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        <Button
          color="blue"
          onClick={openConfirmModal}
          className="w-full py-3 mt-8 text-lg font-semibold text-white transition-colors duration-300 bg-blue-600 rounded-lg hover:bg-blue-700"
          disabled={selectedThumbnailId === null || isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Submit Selection"}
        </Button>
      </div>

      {/* Thumbnail Modal */}
      <Modal
        show={isModalOpen}
        size="4xl"
        onClose={handleModalClose}
        dismissible
      >
        <div className="relative flex justify-center p-4 bg-gray-100 rounded-lg">
          {modalThumbnail && (
            <>
              <CldImage
                width="800"
                height="600"
                src={modalThumbnail.title}
                alt={`Thumbnail ${modalThumbnail._id}`}
                className="object-cover w-full h-auto rounded-lg shadow-lg"
              />
              <button
                onClick={handleModalClose}
                className="absolute p-2 text-white transition-opacity duration-300 bg-black bg-opacity-50 rounded-full top-6 right-6 hover:bg-opacity-75"
              >
                ✕
              </button>
            </>
          )}
        </div>
      </Modal>

      {/* Confirmation Modal */}
      <Modal
        show={isConfirmModalOpen}
        size="md"
        onClose={closeConfirmModal}
        dismissible
      >
        <div className="p-6 text-center bg-white rounded-lg">
          <h3 className="mb-5 text-xl font-bold text-gray-800">
            Confirm Task Submission
          </h3>
          <p className="mb-5 text-gray-600">
            Are you sure you want to submit this task? This action cannot be undone.
          </p>
          <div className="flex justify-center gap-4">
            <Button
              color="gray"
              onClick={closeConfirmModal}
              className="px-6 py-2 text-gray-700 transition-colors duration-300 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </Button>
            <Button
              color="blue"
              onClick={handleSubmitTask}
              disabled={isSubmitting}
              className="px-6 py-2 text-white transition-colors duration-300 bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              {isSubmitting ? "Submitting..." : "Confirm"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
