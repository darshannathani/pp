"use client";
import { motion } from 'framer-motion';

export function FeatureCard({ icon, title, description }) {
  return (
    <motion.div
      className="relative overflow-hidden transition-all duration-300 bg-white shadow-lg rounded-xl hover:shadow-2xl"
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
      <div className="p-8">
        <div className="flex items-center justify-center w-16 h-16 mb-6 text-white rounded-lg shadow-md bg-gradient-to-br from-blue-500 to-indigo-600">
          {icon}
        </div>
        <h3 className="mb-3 text-2xl font-bold text-gray-800">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
    </motion.div>
  );
}