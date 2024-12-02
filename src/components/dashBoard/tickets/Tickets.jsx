import React, { useEffect, useState, useCallback } from "react";
import { useAppSelector } from "@/_lib/store/hooks";
import axios from "axios";
import toast from "react-hot-toast";
import { TicketCard } from "./TicketCard";
import Image from "next/image";

export default function Tickets() {
  const userId = useAppSelector((state) => state.userInfo.id);
  const role = useAppSelector((state) => state.userInfo.role);

  const [isLoading, setIsLoading] = useState(true);
  const [tickets, setTickets] = useState([]);
  const [sortOption, setSortOption] = useState("date");

  // Wrap fetchTickets in useCallback
  const fetchTickets = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await axios.post("/api/ticket/ticketList", {
        userId,
        role,
      });

      if (response.status === 200) {
        setTickets(response?.data?.tickets);
      }
    } catch (error) {
      console.error("Error fetching tickets:", error);
      toast.error("Failed to fetch tickets");
      setTickets([]);
    } finally {
      setIsLoading(false);
    }
  }, [userId, role]); // Add userId and role as dependencies

  useEffect(() => {
    if (userId) {
      fetchTickets();
    }
  }, [userId, fetchTickets]);

  const sortedTickets = [...tickets].sort((a, b) => {
    if (sortOption === "date") {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }
    return 0;
  });

  const SkeletonLoader = () => (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, index) => (
        <div
          key={index}
          className="overflow-hidden bg-white rounded-lg shadow-md"
        >
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-20 h-6 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-16 h-6 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="w-full h-6 mb-2 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-3/4 h-4 mb-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="flex items-center justify-between">
              <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
          <div className="p-3 bg-gray-100">
            <div className="w-32 h-6 mx-auto bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      ))} 
    </div>
  );

  return (
    <div className="p-8 shadow-2xl bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl">
      <h2 className="mb-8 text-3xl font-extrabold text-center text-gray-800">
        Ticket History
      </h2>

      <div className="flex justify-end mb-6">
        <select
          className="p-2 border border-gray-300 rounded-md"
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
        >
          <option value="date">Sort by Date</option>
        </select>
      </div>

      {isLoading ? (
        <SkeletonLoader />
      ) : sortedTickets.length === 0 ? (
        <div className="flex flex-col items-center">
          <Image
            src="/images/NoData.png"
            alt="No Data Available"
            width={400}
            height={300}
            className="mb-4"
          />
          <p className="text-lg text-gray-600">No tickets available.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sortedTickets.map((ticket) => (
            <TicketCard key={ticket._id} ticket={ticket} />
          ))}
        </div>
      )}
    </div>
  );
}
