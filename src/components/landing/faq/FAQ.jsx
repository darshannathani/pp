"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import { upliftFaqs } from "@/_constants/landing/upliftFaqs";

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={false}
      animate={{ backgroundColor: isOpen ? "rgba(239, 246, 255, 0.6)" : "rgba(255, 255, 255, 0.6)" }}
      className="border-b border-blue-100 backdrop-blur-sm"
    >
      <button
        className="flex items-center justify-between w-full py-6 text-left transition-colors duration-300 hover:bg-blue-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="ml-6 text-lg font-semibold text-gray-900">{question}</span>
        <motion.div
          initial={false}
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.3 }}
          className="mr-6"
        >
          {isOpen ? <Minus className="w-6 h-6 text-blue-600" /> : <Plus className="w-6 h-6 text-blue-600" />}
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial="collapsed"
            animate="open"
            exit="collapsed"
            variants={{
              open: { opacity: 1, height: "auto" },
              collapsed: { opacity: 0, height: 0 }
            }}
            transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
          >
            <div className="pb-6 mx-6 text-gray-600">
              <p>{answer}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export function FAQ() {
  return (
    <section className="py-24 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl px-4 mx-auto sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Frequently Asked <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Questions</span>
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            Can&apos;t find the answer you&apos;re looking for? Reach out to our customer support team.
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="overflow-hidden bg-white bg-opacity-50 shadow-2xl rounded-3xl backdrop-blur-lg"
        >
          {upliftFaqs.map((faq, index) => (
            <FAQItem key={index} question={faq.question} answer={faq.answer} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}