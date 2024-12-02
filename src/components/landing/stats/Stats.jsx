"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const statItems = [
  { label: 'Developers', value: 5000, suffix: '+', icon: '👨‍💻' },
  { label: 'Testers', value: 10000000, suffix: '+', icon: '🧪' },
  { label: 'Companies', value: 250, suffix: '+', icon: '🏢' },
];

const Counter = ({ value, duration }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseInt(value.toString().substring(0, 3));
    if (start === end) return;

    let totalMilSecDur = parseInt(duration);
    let incrementTime = (totalMilSecDur / end) * 1000;

    let timer = setInterval(() => {
      start += 1;
      setCount(String(start) + value.toString().substring(3));
      if (start === end) clearInterval(timer);
    }, incrementTime);

    return () => clearInterval(timer);
  }, [value, duration]);

  return <span>{count}</span>;
};

export function Stats() {
  return (
    <section className="relative py-24 overflow-hidden bg-gradient-to-br from-indigo-900 via-blue-900 to-indigo-800">
      <div className="absolute inset-0 bg-[url('/path/to/texture.png')] opacity-10"></div>
      <div className="relative z-10 px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <h2 className="text-4xl font-extrabold text-white sm:text-5xl lg:text-6xl">
            Impactful <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">Statistics</span>
          </h2>
          <p className="max-w-2xl mx-auto mt-4 text-xl text-indigo-200">
            Witness the transformative power of our platform
          </p>
        </motion.div>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {statItems.map((item, index) => (
            <motion.div
              key={item.label}
              className="p-8 text-center transition duration-500 transform bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-2xl hover:scale-105"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="mb-4 text-6xl">{item.icon}</div>
              <dt className="mb-2 text-2xl font-semibold text-indigo-200">
                {item.label}
              </dt>
              <dd className="text-5xl font-extrabold text-white">
                <Counter value={item.value} duration={2000} />
                <span className="text-cyan-400">{item.suffix}</span>
              </dd>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}