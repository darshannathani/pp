"use client";

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';

export function FooterComponent() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-12 text-white bg-gradient-to-r from-blue-600 to-indigo-800">
      <div className="container px-4 mx-auto">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center mb-4">
              <Image src="/images/Logo.png" alt="Uplift Logo" width={50} height={50} className="mr-3" />
              <span className="self-center text-2xl font-semibold whitespace-nowrap">Uplift</span>
            </Link>
            <p className="mb-4 text-gray-300">
              Bridging the gap between businesses and passionate testers. Get valuable feedback and launch with confidence!
            </p>
            <div className="flex space-x-4">
              {[FaFacebook, FaTwitter, FaInstagram, FaLinkedin].map((Icon, index) => (
                <motion.a
                  key={index}
                  href="#"
                  className="text-white transition-colors duration-300 hover:text-gray-200"
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Icon size={24} />
                </motion.a>
              ))}
            </div>
          </div>
          <div>
            <h2 className="mb-4 text-xl font-bold">Quick Links</h2>
            <ul className="space-y-2">
              {['About', 'Services', 'Contact', 'Blog'].map((item, index) => (
                <motion.li key={index} whileHover={{ x: 5 }}>
                  <Link href="#" className="transition-colors duration-300 hover:text-gray-300">
                    {item}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="mb-4 text-xl font-bold">Legal</h2>
            <ul className="space-y-2">
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Disclaimer'].map((item, index) => (
                <motion.li key={index} whileHover={{ x: 5 }}>
                  <Link href="#" className="transition-colors duration-300 hover:text-gray-300">
                    {item}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
        <div className="pt-8 mt-8 text-center border-t border-blue-400">
          <p>&copy; {currentYear} Uplift. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}