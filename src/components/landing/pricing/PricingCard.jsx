"use client";

import { motion } from "framer-motion";
export default function PricingCard({ name, badge, price, color, description, includes, unit }) {
  return (
    <motion.div
      className="w-full max-w-sm overflow-hidden bg-white shadow-xl rounded-3xl"
      whileHover={{ translateY: -10 }}
      transition={{ duration: 0.3 }}
    >
      <div className={`p-1 ${color}`}>
        <div className="p-8 bg-white rounded-t-3xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-bold text-gray-900">{name}</h3>
            <span className={`px-3 py-1 text-xs font-semibold ${color} text-white rounded-full`}>
              {badge}
            </span>
          </div>
          <div className="mb-6">
            <span className="text-5xl font-extrabold">{price}</span>
            <span className="text-xl text-gray-500">/{unit}</span>
          </div>
          <p className="mb-8 text-gray-600">{description}</p>
          <ul className="mb-8 space-y-4">
            {includes?.map((feature, index) => (
              <li key={index} className="flex items-center">
                <svg className="w-5 h-5 mr-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-600">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="p-8">
        <button className={`w-full py-4 px-6 text-white font-semibold rounded-xl shadow-lg ${color} hover:opacity-90 transition duration-300 transform hover:scale-105`}>
          Choose Plan
        </button>
      </div>
    </motion.div>
  );
}