import React, { useState } from "react";
import { FaChevronLeft } from "react-icons/fa";
import PriductReview from "../creatorTask/productReview/ProductReview";
import YouTube from "../creatorTask/youtube/YouTube";
import AppTesting from "../creatorTask/appTesting/AppTesting";
import Survey from "../creatorTask/survey/Survey";
import DefaultComponent from "../../default/Default";

// Define Task List
const TaskList = [
  { name: "Product Review", icon: "🛒", color: "bg-purple-100" },
  { name: "YouTube Thumbnail", icon: "🎥", color: "bg-red-100" },
  { name: "App Testing", icon: "📱", color: "bg-blue-100" },
  { name: "Survey", icon: "📋", color: "bg-green-100" },
];

// Map Task Names to Components
const TaskListMap = {
  "Product Review": PriductReview,
  "YouTube Thumbnail": YouTube,
  "App Testing": AppTesting,
  Survey: Survey,
};

export default function AddTask() {
  const [task, setTask] = useState(null); // State to track selected task

  const handleTaskSelect = (selectedTask) => {
    setTask(selectedTask);
  };

  const TaskComponent = TaskListMap[task?.name] || DefaultComponent;

  return (
    <div className="container p-6 mx-auto">
      {task === null ? (
        <>
          <h1 className="mb-6 text-2xl font-bold text-center text-gray-800">
            Choose Your Task
          </h1>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {TaskList.map((taskItem, index) => (
              <div
                key={index}
                onClick={() => handleTaskSelect(taskItem)}
                className={`p-6 cursor-pointer rounded-lg shadow-md transition-transform duration-300 hover:shadow-lg hover:scale-105 ${taskItem.color}`}
              >
                <div className="mb-4 text-4xl text-center">{taskItem.icon}</div>
                <h2 className="text-xl font-semibold text-center text-gray-800">
                  {taskItem.name}
                </h2>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-6">
            <button
              className="flex items-center text-blue-600 transition duration-300 hover:text-blue-800"
              onClick={() => setTask(null)}
            >
              <FaChevronLeft className="w-5 h-5 mr-2" />
              Back to Task Selection
            </button>
            <h2 className="text-2xl font-bold text-gray-800">{task.name}</h2>
          </div>
          <div className={`p-6 rounded-lg shadow-md ${task.color}`}>
            <TaskComponent />
          </div>
        </div>
      )}
    </div>
  );
}
