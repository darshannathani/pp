import React, { useState } from "react";
import { Badge, Modal, Button, TextInput, Spinner } from "flowbite-react";
import { FaTicketAlt, FaEye, FaPaperPlane } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useAppSelector } from "@/_lib/store/hooks";

export function TicketCard({ ticket }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState(ticket.messages);
  const [isSending, setIsSending] = useState(false);
  const { role } = useAppSelector((state) => state.userInfo);

  const handleClick = () => {
    if (ticket.isOpen) {
      setIsModalOpen(true);
    }
  };

  const statusColor = (isOpen) => {
    return isOpen
      ? "bg-yellow-100 text-yellow-800"
      : "bg-green-100 text-green-800";
  };

  const latestMessage = messages[messages.length - 1];

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      setIsSending(true);
      const newMessageObj = {
        content: newMessage,
        sender: role,
        sentAt: new Date().toISOString(),
      };

      try {
        const response = await axios.post("/api/ticket/addMessage", {
          ticketId: ticket._id,
          message: newMessageObj,
        });

        if (response.status === 201) {
          setMessages([...messages, newMessageObj]);
          setNewMessage("");
          toast.success("Message sent successfully");
        } else {
          throw new Error("Failed to send message");
        }
      } catch (error) {
        console.error("Error sending message:", error);
        toast.error("Failed to send message. Please try again.");
      } finally {
        setIsSending(false);
      }
    }
  };

  const getSenderColor = (sender) => {
    switch (sender) {
      case "tester":
        return "bg-blue-100 text-blue-800";
      case "admin":
        return "bg-green-100 text-green-800";
      case "creator":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <>
      <div
        className="overflow-hidden transition duration-300 bg-white rounded-lg shadow-md cursor-pointer hover:shadow-lg hover:-translate-y-1"
        onClick={handleClick}
      >
        <div className="p-5">
          <div className="flex items-center justify-between mb-3">
            <Badge color="indigo" icon={FaTicketAlt} className="px-2.5 py-0.5">
              Ticket
            </Badge>
            <Badge
              color="light"
              className={`px-2.5 py-0.5 ${statusColor(ticket.isOpen)}`}
            >
              {ticket.isOpen ? "Open" : "Closed"}
            </Badge>
          </div>
          <h3 className="mb-2 text-lg font-semibold text-gray-800 line-clamp-2">
            {ticket.heading}
          </h3>
          <p className="mb-4 text-sm text-gray-600 line-clamp-3">
            Latest message: {latestMessage.content}
          </p>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>: {ticket.taskId.slice(0, 8)}...</span>
            <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        <div
          className={` ${
            ticket.isOpen ? "" : "hidden"
          } p-3 text-center transition-colors duration-300 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100`}
        >
          <span className="flex items-center justify-center text-sm font-medium text-indigo-600">
            <FaEye className="mr-2" /> View Details
          </span>
        </div>
      </div>

      <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)} size="xl">
        <Modal.Header>Ticket Details</Modal.Header>
        <Modal.Body>
          <div className="mb-4">
            <h3 className="text-lg font-semibold">
              Ticket ID: {ticket.ticketId}
            </h3>
            <p className="text-sm text-gray-600">Task ID: {ticket.taskId}</p>
            <p className="text-sm text-gray-600">
              Status: {ticket.isOpen ? "Open" : "Closed"}
            </p>
          </div>
          <div className="mb-4 space-y-4 overflow-y-auto h-96">
            {messages.map((message, index) => (
              <div
                key={message._id || index}
                className={`p-3 rounded-lg ${
                  message.sender === role
                    ? "bg-blue-100 ml-auto"
                    : "bg-gray-100"
                } max-w-[80%]`}
              >
                <div
                  className={`px-2 py-1 rounded-t-lg font-semibold ${getSenderColor(
                    message.sender
                  )}`}
                >
                  {message.sender.charAt(0).toUpperCase() +
                    message.sender.slice(1)}
                </div>
                <div className="p-2 bg-white border border-t-0 border-gray-200 rounded-b-lg">
                  <p className="text-sm">{message.content}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    {new Date(message.sentAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={handleSendMessage} className="flex items-center">
            <TextInput
              type="text"
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-grow mr-2"
              disabled={isSending}
            />
            <Button type="submit" color="blue" disabled={isSending}>
              {isSending ? (
                <Spinner size="sm" light={true} />
              ) : (
                <FaPaperPlane className="mr-2" />
              )}
              Send
            </Button>
          </form>
        </Modal.Body>
      </Modal>
    </>
  );
}
