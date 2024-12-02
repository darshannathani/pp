import React, { useEffect, useState, useCallback } from "react"; // Import useCallback
import { useAppDispatch, useAppSelector } from "@/_lib/store/hooks";
import {
  addResponseTasks,
  clearResponseTask,
} from "@/_lib/store/features/tester/responseTask/responseTaskSlice";
import { clearAvailableTask } from "@/_lib/store/features/tester/availableTask/availableTaskSlice";
import { Card, Progress, Button, Modal } from "flowbite-react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import SurveyCard from "./SurveyCard";
import { FaChevronLeft, FaClipboardList } from "react-icons/fa";
import { clearHistoryUser } from "@/_lib/store/features/shared/history/historyTesterSlice";

const SurveysResponse = () => {
  const searchParams = useSearchParams();
  const taskId = searchParams.get("taskId");
  const type = searchParams.get("type");
  const dispatch = useAppDispatch();
  const router = useRouter();

  const [questionNo, setQuestionNo] = useState(1);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [verificationStep, setVerificationStep] = useState(false);
  const [verificationQuestion, setVerificationQuestion] = useState(null);
  const [verificationAnswer, setVerificationAnswer] = useState(null);

  const taskMapping = {
    SurveyTask: "surveys",
    YoutubeTask: "youtube",
    AppTask: "app",
  };

  const taskInfo = useAppSelector((state) => {
    const storeKey = taskMapping[type];
    return state.availableTask[storeKey].find((task) => task._id === taskId)
      ?.specificTaskDetails;
  });

  const testerId = useAppSelector((state) => state.userInfo.id);
  const noOfQuestions = taskInfo?.noOfQuestions || 0;
  const questions = taskInfo?.questions || [];

  const responseTaskData = useAppSelector(
    (state) => state.responseTask.response
  );

  const onSubmit = (event) => {
    event.preventDefault();

    if (selectedOption !== null) {
      const response = {
        questionId: questionNo,
        answer: questions[questionNo - 1].options[selectedOption],
      };

      dispatch(addResponseTasks([response]));

      if (questionNo < noOfQuestions) {
        setQuestionNo(questionNo + 1);
        setSelectedOption(null);
      } else {
        setShowConfirmModal(true);
      }
    } else {
      toast.error("Please select an option.");
    }
  };

  const handleSubmitTask = () => {
    setShowConfirmModal(false);
    // Select a random question for verification
    const randomIndex = Math.floor(Math.random() * responseTaskData.length);
    const randomQuestion = questions[randomIndex];
    setVerificationQuestion(randomQuestion);
    setVerificationStep(true);
  };

  const handleVerificationSubmit = () => {
    const originalAnswer = responseTaskData.find(
      (response) => response.questionId === verificationQuestion.questionId
    )?.answer;

    if (verificationAnswer === originalAnswer) {
      submitFinalTask();
    } else {
      rejectSurvey();
    }
  };

  // Wrap rejectSurvey in useCallback to memoize it
  const rejectSurvey = useCallback(async () => {
    try {
      const surveyResponse = await axios.post(
        "/api/task/survey/taskResponseReject",
        {
          taskId,
          testerId,
        }
      );

      if (surveyResponse.status === 201) {
        dispatch(clearResponseTask());
        dispatch(clearAvailableTask());
        dispatch(clearHistoryUser());
        toast.error(
          "Verification failed. Your responses don't match. Survey rejected."
        );
        router.push("dashboard?activeTab=available-task");
      }
    } catch (error) {
      console.error("Error rejecting survey:", error);
    }
  }, [dispatch, router, taskId, testerId]); // Add necessary dependencies

  const submitFinalTask = async () => {
    setIsSubmitting(true);
    try {
      const surveyResponse = { taskId, testerId, response: responseTaskData };
      const response = await axios.post(
        "/api/task/survey/taskResponse",
        surveyResponse
      );

      if (response.status === 201) {
        dispatch(clearResponseTask());
        dispatch(clearAvailableTask());
        dispatch(clearHistoryUser());
        toast.success("Task submitted successfully!");
        router.push("dashboard?activeTab=history");
      }
    } catch (error) {
      console.error(
        "Error Submitting task:",
        error.response ? error.response.data : error.message
      );
      toast.error("Failed to submit task.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOptionClick = (index) => {
    setSelectedOption(index);
  };

  const progressPercentage = (questionNo / noOfQuestions) * 100;

  // Detect back button and reload events
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (verificationStep) {
        event.preventDefault();
        event.returnValue = ""; // Required for some browsers
        rejectSurvey();
      }
    };

    const handlePopState = () => {
      if (verificationStep) {
        rejectSurvey();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [verificationStep, rejectSurvey]); // Add rejectSurvey as a dependency

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-3xl overflow-hidden bg-white rounded-lg shadow-xl">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <Button
              color="light"
              size="sm"
              onClick={() => router.push("dashboard?activeTab=available-task")}
              className="flex items-center px-4 py-2 text-blue-600 transition duration-300 bg-blue-100 rounded-full hover:bg-blue-200"
            >
              <FaChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>

          {!verificationStep && (
            <div className="mb-8">
              <Progress
                progress={progressPercentage}
                size="lg"
                color="blue"
                className="h-3 rounded-full"
              />
              <p className="mt-2 text-sm text-right text-gray-600">
                Question {questionNo} of {noOfQuestions}
              </p>
            </div>
          )}

          {!verificationStep ? (
            <SurveyCard
              questionNo={questionNo}
              questions={questions}
              selectedOption={selectedOption}
              handleOptionClick={handleOptionClick}
              handleSubmit={onSubmit}
              isSubmitting={isSubmitting}
              noOfQuestions={noOfQuestions}
            />
          ) : (
            <div>
              <h2 className="mb-6 text-2xl font-bold text-center text-gray-800">
                Verification Question
              </h2>
              <h3 className="mb-4 text-xl font-semibold text-gray-700">
                {verificationQuestion?.title}
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {verificationQuestion?.options.map((option, index) => (
                  <Button
                    key={index}
                    className={`w-full py-4 text-lg font-semibold text-white transition-all duration-300 ${
                      verificationAnswer === option
                        ? "border-4 border-white ring-4 ring-blue-300"
                        : ""
                    } bg-blue-500`}
                    onClick={() => setVerificationAnswer(option)}
                  >
                    {option}
                  </Button>
                ))}
              </div>
              <Button
                onClick={handleVerificationSubmit}
                color="blue"
                className="w-full py-3 mt-6 text-lg font-semibold transition-colors duration-300"
                disabled={!verificationAnswer}
              >
                Submit Verification
              </Button>
            </div>
          )}
        </div>
      </Card>

      <Modal
        show={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        className="bg-white rounded-lg shadow-xl"
      >
        <Modal.Header className="border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800">
            Confirm Submission
          </h3>
        </Modal.Header>
        <Modal.Body>
          <div className="flex flex-col items-center justify-center p-4">
            <FaClipboardList className="w-16 h-16 mb-4 text-blue-500" />
            <p className="text-lg text-center text-gray-600">
              Are you sure you want to submit your answers?
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            color="gray"
            onClick={() => setShowConfirmModal(false)}
            className="w-full py-2"
          >
            Cancel
          </Button>
          <Button
            color="blue"
            onClick={handleSubmitTask}
            className="w-full py-2"
          >
            Submit
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default SurveysResponse;
