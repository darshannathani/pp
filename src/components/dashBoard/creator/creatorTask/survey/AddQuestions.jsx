"use client";
import { useState } from "react";
import { Button, TextInput, Card } from "flowbite-react";
import { useForm } from "react-hook-form";
import { useAppDispatch, useAppSelector } from "@/_lib/store/hooks";
import toast from "react-hot-toast";
import {
  addQuestion,
  clearSurveyTask,
} from "@/_lib/store/features/creator/surveyTask/surveyTaskSlice";
import axios from "axios";
import { useRouter } from "next/navigation";
import { clearHistoryUser } from "@/_lib/store/features/shared/history/historyTesterSlice";

export const AddQuestions = () => {
  const [options, setOptions] = useState([
    { text: "", color: "bg-red-500" },
    { text: "", color: "bg-blue-500" },
    { text: "", color: "bg-green-500" },
    { text: "", color: "bg-yellow-500" },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(false);

  const router = useRouter();
  const [questionNo, setQuestionNo] = useState(1);
  const noOfQuestions = useAppSelector(
    (state) => state.surveyTask.noOfQuestions
  );
  const dispatch = useAppDispatch();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: "",
      options: [],
      answer_type: "multiple-choice",
    },
  });

  let uploadSurveyTaskData = useAppSelector((state) => state.surveyTask);

  const openModal = () => setShowModal(true);
  const handleConfirm = async () => {
    setShowModal(false);
    setConfirmAction(true);
    // Proceed with the task upload
    await uploadTask();
  };
  const handleCancel = () => {
    setShowModal(false);
    setConfirmAction(false);
  };

  const uploadTask = async () => {
    try {
      const response = await axios.post(
        "/api/task/survey/addtask",
        uploadSurveyTaskData
      );
      if (response.status === 201) {
        dispatch(clearSurveyTask());
        dispatch(clearHistoryUser());
        toast.success("Task uploaded successfully!");
        router.push("dashboard?activeTab=analytics");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 402) {
          setErrorMessage("Insufficient funds in wallet");
          toast.error("Insufficient funds in wallet");
        } else {
          setErrorMessage("Failed to create task. Please try again.");
          console.error("Axios error:", error.response?.data || error.message);
        }
      } else {
        console.error("Non-Axios error:", error);
        console.error(
          "Error uploading task:",
          error.response ? error.response.data : error.message
        );
        toast.error("Failed to upload task.");
      }
    }
  };

  const handleUploadTask = () => {
    if (!confirmAction) {
      openModal();
    }
  };

  const onSubmit = async (data, event) => {
    event.preventDefault();
    const questionData = {
      title: data.title,
      options: options.map((ele) => ele.text),
      answer_type: "multiple-choice",
    };

    // Dispatch addQuestion action
    dispatch(addQuestion({ question: questionData }));

    // Show success toast
    toast.success("Question added successfully!");

    // Reset the form and options
    reset();
    setOptions([
      { text: "", color: "bg-red-500" },
      { text: "", color: "bg-blue-500" },
      { text: "", color: "bg-green-500" },
      { text: "", color: "bg-yellow-500" },
    ]);

    // Increment question number
    setQuestionNo((prev) => prev + 1);
  };

  const handleOptionChange = (index, value) => {
    setOptions((prevOptions) =>
      prevOptions.map((option, i) =>
        i === index ? { ...option, text: value } : option
      )
    );
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen px-4 pb-4">
      {questionNo > noOfQuestions ? (
        <>
          <Button
            color={"blue"}
            onClick={handleUploadTask}
            className="w-full mt-4 text-center"
          >
            Upload Task
          </Button>
          {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div className="p-6 bg-white rounded-lg shadow-lg w-80">
                <h3 className="mb-4 text-lg font-bold">Confirm Upload</h3>
                <p className="mb-4">
                  Are you sure you want to upload the task?
                </p>
                <div className="flex justify-end gap-4">
                  <Button color="gray" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button color="blue" onClick={handleConfirm}>
                    Confirm
                  </Button>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          <h2 className="mb-4 text-2xl font-bold">
            {questionNo} out of {noOfQuestions}
          </h2>
          <Card className="w-full max-w-3xl p-6">
            <form method="POST" onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-4">
                <TextInput
                  id="title"
                  type="text"
                  placeholder="Enter Question"
                  name="title"
                  {...register("title", {
                    required: "Title name is required",
                  })}
                  required
                  className="w-full mb-2 text-lg font-semibold text-center"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {options.map((option, index) => (
                  <div key={index} className="relative">
                    <textarea
                      value={option.text}
                      onChange={(e) =>
                        handleOptionChange(index, e.target.value)
                      }
                      className={`w-full py-8 text-xl font-bold text-white ${option.color}`}
                      required
                    />
                  </div>
                ))}
              </div>

              <Button
                type="submit"
                color={"blue"}
                className="w-full mt-4 text-center"
              >
                Save Questions
              </Button>
            </form>
          </Card>
        </>
      )}
    </div>
  );
};
