"use client"
import { useState } from "react";
import ProductReviewForm from "./ProductReviewForm";
export default function ProductReview() {
    const [taskCreated, setTaskCreated] = useState(false);
    return (
      <section className="flex items-center justify-center">
        <ProductReviewForm setTaskCreated={setTaskCreated} />
      </section>
    )
  }