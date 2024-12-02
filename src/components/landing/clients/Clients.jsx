"use client";
import { motion } from 'framer-motion';
import Image from 'next/image';

const clients = [
  { name: 'Microsoft', logo: '/images/clients/microsoft-logo.svg' },
  { name: 'Adobe', logo: '/images/clients/adobe-logo.svg' },
  { name: 'Salesforce', logo: '/images/clients/salesforce-logo.svg' },
  { name: 'Atlassian', logo: '/images/clients/atlassian-logo.svg' },
  { name: 'Slack', logo: '/images/clients/slack-logo.svg' },
  { name: 'Dropbox', logo: '/images/clients/dropbox-logo.svg' },
];

export function Clients() {
  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Trusted by Global Innovators
          </h2>
          <p className="max-w-2xl mx-auto mt-3 text-xl text-gray-500 sm:mt-4">
            Join world-class companies in elevating product quality through collaborative testing.
          </p>
        </motion.div>
        <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-6">
          {clients.map((client, index) => (
            <motion.div
              key={client.name}
              className="flex flex-col items-center justify-center col-span-1"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
                ease: [0, 0.71, 0.2, 1.01]
              }}
            >
              <motion.div
                whileHover={{ scale: 1.05, filter: 'brightness(1.2)' }}
                whileTap={{ scale: 0.95 }}
                className="relative w-40 h-20 mb-2"
              >
                <Image
                  src={client.logo}
                  alt={`${client.name} logo`}
                  layout="fill"
                  objectFit="contain"
                  className="transition-all duration-300"
                />
              </motion.div>
              <motion.p
                className="text-sm font-medium text-gray-600"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 + index * 0.1 }}
              >
                {client.name}
              </motion.p>
            </motion.div>
          ))}
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-16 text-center"
        >
          <a
            href="#"
            className="inline-flex items-center px-6 py-3 text-base font-medium text-white transition-colors duration-300 bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
          >
            Elevate Your Testing Process
            <svg
              className="w-5 h-5 ml-2 -mr-1"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </a>
        </motion.div>
      </div>
    </section>
  );
}