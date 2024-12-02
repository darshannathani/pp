"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Phone, Mail, ChevronDown, Menu, X, Clock } from "lucide-react";

export function HeaderComponent() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  const navigationItems = [
    { 
      text: "Services", 
      href: "#services", 
      subItems: [
        { text: "Web Development", href: "#web-dev" },
        { text: "Mobile Apps", href: "#mobile-apps" },
        { text: "Cloud Solutions", href: "#cloud" }
      ]
    },
    { 
      text: "Products", 
      href: "#products", 
      subItems: [
        { text: "Product 1", href: "#product1" },
        { text: "Product 2", href: "#product2" }
      ]
    },
    { 
      text: "About", 
      href: "#about", 
      subItems: [
        { text: "Our Story", href: "#story" },
        { text: "Team", href: "#team" }
      ]
    }
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
      {/* First Row: Logo and Contact Info */}
      <div className="w-full px-16 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-3">
          <Image
            src="/images/logo-side.png"
            width={75}
            height={75}
            alt="P&P Impex Logo"
            className="w-auto h-10 sm:h-14 "
          />
          {/* <span className="text-2xl font-semibold text-gray-800 font-sans">P&P Impex</span> */}
        </Link>

        {/* Contact Info - Desktop */}
        <div className="hidden md:flex items-center space-x-8">
          <div className="flex items-center space-x-2 text-gray-600">
            <Phone size={34} className=" text-blue-700"/>
            <div className="flex flex-col">
              <span className="text-m font-semibold">Phone</span>
              <a href="tel:+919924946888" className="text-m hover:underline">+91 99249 46888</a>
            </div>
          </div>
          <div className="h-10 border-l border-gray-400"></div> {/* Vertical Line */}

          <div className="flex items-center space-x-2 text-gray-600">
            <Mail size={34} className=" text-blue-700"/>
            <div className="flex flex-col">
              <span className="text-m font-semibold">Email</span>
              <a href="mailto:pandpimpex297@gmail.com" className="text-m hover:underline">pandpimpex297@gmail.com</a>
            </div>
          </div>
          <div className="h-10 border-l border-gray-400"></div> {/* Vertical Line */}

          <div className="flex items-center space-x-2 text-gray-600">
            <Clock size={34} className=" text-blue-700"/>
            <div className="flex flex-col">
              <span className="text-m font-semibold">Office Hours</span>
              <span className="text-m">10 AM - 7 PM</span>
            </div>
          </div>
        </div>




        {/* Mobile Menu Toggle */}
        <div className="md:hidden">
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="text-gray-600 hover:text-blue-600"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Second Row: Navigation Menu */}
      <nav className="w-full px-4 py-1 bg-gray-100">
        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-6 justify-center relative">
          {navigationItems.map((item, index) => (
            <div 
              key={index} 
              className="relative group"
              onMouseEnter={() => setActiveDropdown(index)}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              {/* Extend hover area with invisible padding */}
              <div className="relative">
                <button 
                  className="flex items-center text-gray-700 hover:text-blue-600 transition-colors pb-2 pt-2"
                >
                  {item.text}
                  <ChevronDown size={16} className="ml-1" />
                </button>
                
                {/* Invisible hover area to prevent dropdown from disappearing */}
                <div 
                  className="absolute bottom-0 left-0 top-8 right-0 h-4 group-hover:bg-transparent"
                ></div>
              </div>
              
              {activeDropdown === index && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white shadow-lg rounded-md border border-gray-200 z-50">
                  {item.subItems.map((subItem, subIndex) => (
                    <Link
                      key={subIndex}
                      href={subItem.href}
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                    >
                      {subItem.text}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Mobile Navigation Menu - Previous implementation remains the same */}
        {isOpen && (
          <div className="md:hidden space-y-4 mt-4">
            {/* Mobile contact info and navigation items */}
            {/* ... (previous mobile menu implementation) */}
          </div>
        )}
      </nav>
    </header>
  );
}