import React from 'react';
import { Button } from 'flowbite-react';

const SurveyCard = ({ questionNo, questions, selectedOption, handleOptionClick, handleSubmit, isSubmitting, noOfQuestions }) => {
  // Define vibrant colors for the options, similar to Kahoot
  const kahootColors = ["bg-red-500", "bg-blue-500", "bg-green-500", "bg-yellow-500"];

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold text-center text-gray-800">
        Question {questionNo} of {noOfQuestions}
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <h3 className="mb-4 text-xl font-semibold text-gray-700">
            {questions[questionNo - 1]?.title}
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {questions[questionNo - 1]?.options.map((option, index) => (
              <Button
                key={index}
                // Apply vibrant Kahoot-style background colors
                className={`w-full py-4 text-lg font-semibold text-white transition-all duration-300 ${
                  selectedOption === index
                    ? "border-4 border-white ring-4 ring-blue-300"
                    : ""
                } ${kahootColors[index % kahootColors.length]}`} // Cycle through the colors for options
                onClick={() => handleOptionClick(index)}
              >
                {option}
              </Button>
            ))}
          </div>
        </div>
        <Button
          type="submit"
          color="blue"
          className="w-full py-3 text-lg font-semibold transition-colors duration-300"
          disabled={isSubmitting}
        >
          {questionNo === noOfQuestions ? "Submit Survey" : "Next Question"}
        </Button>
      </form>
    </div>
  );
};

export default SurveyCard;
