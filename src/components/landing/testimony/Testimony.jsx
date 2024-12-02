"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { testimonials } from "@/_constants/landing/testimonials";
import Image from "next/image";

export function Testimony() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const nextTestimonial = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
  }, []);

  const prevTestimonial = useCallback(() => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length
    );
  }, []);

  useEffect(() => {
    let interval;
    if (isAutoPlaying) {
      interval = setInterval(nextTestimonial, 2000); // Change slide every 5 seconds
    }
    return () => clearInterval(interval);
  }, [isAutoPlaying, nextTestimonial]);

  return (
    <section
      id="landingTestimony"
      className="py-20 overflow-hidden bg-gradient-to-b from-gray-50 to-white"
    >
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-4xl font-extrabold text-center text-gray-900 md:text-5xl"
        >
          What Our Clients Say
        </motion.h2>
        <div className="relative"
             onMouseEnter={() => setIsAutoPlaying(false)}
             onMouseLeave={() => setIsAutoPlaying(true)}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
              className="p-8 bg-white shadow-xl rounded-2xl md:p-12"
            >
              <div className="flex flex-col items-center md:flex-row">
                <div className="mb-6 md:w-1/3 md:mb-0">
                  <Image
                    src={testimonials[currentIndex].img}
                    alt={`${testimonials[currentIndex].author} profile`}
                    width={150}
                    height={150}
                    className="border-4 border-indigo-500 rounded-full shadow-lg"
                  />
                </div>
                <div className="md:w-2/3 md:pl-8">
                  <blockquote>
                    <svg
                      className="w-10 h-10 mb-4 text-indigo-500"
                      fill="currentColor"
                      viewBox="0 0 32 32"
                    >
                      <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                    </svg>
                    <p className="mb-4 text-xl font-medium text-gray-900 md:text-2xl">
                      {testimonials[currentIndex].quote}
                    </p>
                  </blockquote>
                  <div className="font-semibold text-indigo-600">
                    {testimonials[currentIndex].author}
                  </div>
                  <div className="text-gray-600">
                    {testimonials[currentIndex].company}
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
          <div className="flex justify-center mt-8 space-x-4">
            <button
              onClick={prevTestimonial}
              className="p-2 text-white transition-colors duration-300 bg-indigo-500 rounded-full hover:bg-indigo-600"
              aria-label="Previous testimonial"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              onClick={nextTestimonial}
              className="p-2 text-white transition-colors duration-300 bg-indigo-500 rounded-full hover:bg-indigo-600"
              aria-label="Next testimonial"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}