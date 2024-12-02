"use client";
import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { blogPosts } from '@/_constants/landing/blogPosts';


export function Blogs() {
  return ( 
    <section id="landingBlogs" className="py-24 bg-gradient-to-br from-gray-50 to-white">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl lg:text-6xl">
            Latest <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Insights</span>
          </h2>
          <p className="max-w-2xl mx-auto mt-4 text-xl text-gray-600">
            Uncover actionable insights and stay ahead with our cutting-edge industry trends
          </p>
        </motion.div>

        <div className="grid gap-12 mt-12 md:grid-cols-2 lg:gap-x-16 lg:gap-y-12">
          {blogPosts.map((post, index) => (
            <motion.article
              key={index}
              className="relative p-6 transition-all duration-300 bg-white border-l-4 border-blue-600 shadow-lg rounded-2xl hover:shadow-xl"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 text-xs font-semibold text-white bg-blue-600 rounded-full">
                  {post.category}
                </span>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <span>{post.date}</span>
                  <span>•</span>
                  <span>{post.readTime}</span>
                </div>
              </div>
              <h3 className="mb-3 text-2xl font-bold leading-tight text-gray-900 transition-colors duration-200 hover:text-blue-600">
                <a href="#">{post.title}</a>
              </h3>
              <p className="mb-4 text-gray-600">{post.excerpt}</p>
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center space-x-3">
                  <Image
                    className="rounded-full"
                    src={post.author.avatar}
                    alt={`${post.author.name} avatar`}
                    width={40}
                    height={40}
                  />
                  <span className="font-medium text-gray-900">{post.author.name}</span>
                </div>
                <motion.a
                  href="#"
                  className="inline-flex items-center text-blue-600 transition-colors duration-200 hover:text-blue-800"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Read more
                  <svg
                    className="w-4 h-4 ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                  </svg>
                </motion.a>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}