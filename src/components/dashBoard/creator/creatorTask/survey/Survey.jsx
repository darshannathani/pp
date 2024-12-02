"use client";
import { useState } from "react";
import { AddQuestions } from "./AddQuestions";
import SurveyForm from "./SurveyForm";

export default function Survey() {
  const [taskCreated, setTaskCreated] = useState(false);
  return (
    <section className="flex items-center justify-center">
      {!taskCreated ? (
        <SurveyForm setTaskCreated={setTaskCreated} />
      ) : (
        <AddQuestions />
      )}
    </section>
  );
}
