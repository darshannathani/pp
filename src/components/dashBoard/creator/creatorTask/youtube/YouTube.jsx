"use client";
import { useState } from "react";
import YouTubeForm from "./YouTubeForm";
import { YouTubeAddImages } from "./YouTubeAddImages";

export default function Survey() {
  const [taskCreated, setTaskCreated] = useState(false);
  return (
    <section className="flex items-center justify-center">
      {!taskCreated ? (
        <YouTubeForm setTaskCreated={setTaskCreated} />
      ) : (
        <YouTubeAddImages />
      )}
    </section>
  );
}
