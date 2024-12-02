"use client";

import { FeatureCard } from './FeatureCard';
import { Users, Target, TrendingUp, Award, ShieldCheck, HeartHandshake } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  {
    icon: <Users size={32} />,
    title: 'User-Centric Approach',
    description: 'Put your users at the heart of your development process.'
  },
  {
    icon: <Target size={32} />,
    title: 'Targeted Feedback',
    description: 'Get insights from testers who match your target audience.'
  },
  {
    icon: <TrendingUp size={32} />,
    title: 'Continuous Improvement',
    description: 'Iterate and improve based on real user experiences.'
  },
  {
    icon: <Award size={32} />,
    title: 'Quality Assurance',
    description: 'Ensure top-notch quality with comprehensive testing.'
  },
  {
    icon: <ShieldCheck size={32} />,
    title: 'Secure Testing',
    description: 'Protect your innovations with our secure testing environment.'
  },
  {
    icon: <HeartHandshake size={32} />,
    title: 'Collaborative Platform',
    description: 'Foster collaboration between developers and testers.'
  }
];

export function Featured() {
  return (
    <section id="landingFeatured" className="py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-16 text-center"
        >
          <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Designed for <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Business Teams</span> Like Yours
          </h2>
          <p className="max-w-3xl mx-auto mt-4 text-xl text-gray-600">
            Empower your team with cutting-edge features that drive innovation and collaboration.
          </p>
        </motion.div>
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}