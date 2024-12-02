"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Mail, Phone, Send } from 'lucide-react';

export function ContactUs() {
  return (
    <section id="landingContactUs" className="py-24 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Get in <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Touch</span>
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            We&apos;d love to hear from you. Our friendly team is always here to chat.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 gap-8 mb-16 lg:grid-cols-3">
          {[
            { icon: MapPin, title: "Our Office", content: "201, Harmony Complex, Rainbow Road, Surat, Gujarat 375006, India" },
            { icon: Mail, title: "Email Us", content: "support@uplift.com", isLink: true },
            { icon: Phone, title: "Call Us", content: "999-777-7890" }
          ].map((item, index) => (
            <motion.div
              key={item.title}
              className="p-8 transition-shadow duration-300 bg-white shadow-lg rounded-2xl hover:shadow-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="flex items-center mb-4">
                <item.icon className="w-8 h-8 mr-3 text-blue-600" />
                <h3 className="text-xl font-semibold text-gray-900">{item.title}</h3>
              </div>
              {item.isLink ? (
                <a href={`mailto:${item.content}`} className="text-blue-600 hover:underline">{item.content}</a>
              ) : (
                <p className="text-gray-600">{item.content}</p>
              )}
            </motion.div>
          ))}
        </div>
        
        <motion.div
          className="overflow-hidden bg-white shadow-2xl rounded-3xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="p-8 lg:p-12">
              <h3 className="mb-8 text-2xl font-bold text-gray-900">Send us a message</h3>
              <form className="space-y-6">
                {["name", "email", "message"].map((field) => (
                  <div key={field}>
                    <label htmlFor={field} className="block mb-1 text-sm font-medium text-gray-700 capitalize">{field}</label>
                    {field === "message" ? (
                      <textarea
                        id={field}
                        name={field}
                        rows="4"
                        className="block w-full px-4 py-3 transition duration-300 border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder={`Enter your ${field}`}
                      />
                    ) : (
                      <input
                        type={field === "email" ? "email" : "text"}
                        id={field}
                        name={field}
                        className="block w-full px-4 py-3 transition duration-300 border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder={`Enter your ${field}`}
                      />
                    )}
                  </div>
                ))}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="w-full px-6 py-3 text-white transition duration-300 rounded-lg shadow-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Send className="inline-block w-5 h-5 mr-2" />
                  Send Message
                </motion.button>
              </form>
            </div>
            <div className="relative h-96 lg:h-auto">
              <iframe
                className="absolute inset-0 w-full h-full"
                frameBorder="0"
                title="map"
                marginHeight="0"
                marginWidth="0"
                scrolling="no"
                src="https://maps.google.com/maps?width=100%&height=600&hl=en&q=Surat,Gujarat,India&ie=UTF8&t=&z=14&iwloc=B&output=embed"
                style={{ filter: 'grayscale(1) contrast(1.2) opacity(0.7)' }}
              ></iframe>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}