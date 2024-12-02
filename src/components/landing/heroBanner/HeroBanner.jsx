"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ChevronRight, Play } from "lucide-react";

export function HeroBanner() {
  return (
    <section className="relative h-screen overflow-hidden text-white -top-4 bg-gradient-to-br from-indigo-900 via-blue-800 to-indigo-900">
      <div className="absolute inset-0 bg-[url('/path/to/texture.png')] opacity-10"></div>
      <svg
        className="absolute bottom-0 left-0 w-full text-indigo-900 fill-current"
        viewBox="0 0 1440 320"
      >
        <path d="M0,288L48,272C96,256,192,224,288,197.3C384,171,480,149,576,165.3C672,181,768,235,864,250.7C960,267,1056,245,1152,224C1248,203,1344,181,1392,170.7L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
      </svg>
      <div className="relative z-10 px-4 py-24 mx-auto max-w-7xl sm:px-6 lg:px-8 lg:py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <Link
            href="#"
            className="inline-flex items-center justify-between px-4 py-2 mb-8 text-sm font-medium text-indigo-100 transition-all duration-300 bg-indigo-800 bg-opacity-50 rounded-full hover:bg-opacity-75"
            role="alert"
          >
            <span className="text-xs bg-indigo-600 rounded-full text-white px-4 py-1.5 mr-3">
              New
            </span>
            <span className="text-sm font-medium">
              Sign up for our newsletter
            </span>
            <ChevronRight className="w-5 h-5 ml-2" />
          </Link>
          <h1 className="mb-8 text-5xl font-extrabold leading-tight tracking-tight text-white md:text-6xl lg:text-7xl">
            Elevate with{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
              Collaborative Testing
            </span>
          </h1>
          <p className="max-w-3xl mx-auto mb-12 text-xl font-normal text-indigo-100 lg:text-2xl">
            Uplift goes beyond traditional testing, fostering a dynamic
            environment where diverse perspectives come together.
          </p>
          <div className="flex flex-col items-center justify-center space-y-4 sm:flex-row sm:space-y-0 sm:space-x-6">
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="#"
              className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white transition-colors duration-300 bg-indigo-600 rounded-lg shadow-lg hover:bg-indigo-700"
            >
              Get Started
              <ArrowRight className="w-5 h-5 ml-2" />
            </motion.a>
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="#"
              className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-indigo-900 transition-colors duration-300 bg-white rounded-lg shadow-lg hover:bg-indigo-50"
            >
              <Play className="w-5 h-5 mr-2" />
              Watch Demo
            </motion.a>
          </div>
        </motion.div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-indigo-900 to-transparent"></div>
    </section>
  );
}
