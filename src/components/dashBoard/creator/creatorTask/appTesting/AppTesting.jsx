"use client";
import { useState } from "react";
import AppTestingForm from "./AppTestingForm";
export default function AppTesting() {
  const [taskCreated, setTaskCreated] = useState(false);
  return (
    <section className="flex items-center justify-center">
        <AppTestingForm setTaskCreated={setTaskCreated} />
    </section>
  );
  }
  