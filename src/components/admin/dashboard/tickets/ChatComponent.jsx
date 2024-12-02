import React, { useEffect, useRef } from "react";
import { TextInput, Button } from "flowbite-react";
import { FaPaperPlane } from "react-icons/fa";

const ChatComponent = ({
  messages,
  newMessage,
  setNewMessage,
  handleSendMessage,
  isSending,
}) => {
  const chatContainerRef = useRef(null);

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

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const formatDate = (dateString) => {
    if (!dateString) return "Date unavailable";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.error("Invalid date:", dateString);
      return "Invalid date";
    }
    return date.toLocaleString();
  };

  return (
    <div className="space-y-4">
      <div
        ref={chatContainerRef}
        className="mb-4 space-y-4 overflow-y-auto h-96"
      >
        {messages.map((message, index) => (
          <div
            key={message._id || index}
            className={`p-3 rounded-lg ${
              message.sender === "admin" ? "bg-blue-100 ml-auto" : "bg-gray-100"
            } max-w-[80%]`}
          >
            <div
              className={`px-2 py-1 rounded-t-lg font-semibold ${getSenderColor(
                message.sender
              )}`}
            >
              {message.sender}
            </div>
            <div className="p-2 bg-white border border-t-0 border-gray-200 rounded-b-lg">
              <p className="text-sm">{message.content}</p>
              <p className="mt-1 text-xs text-gray-500">
                {formatDate(message.sentAt)}
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
            "Sending..."
          ) : (
            <>
              <FaPaperPlane className="mr-2" />
              Send
            </>
          )}
        </Button>
      </form>
    </div>
  );
};

export default ChatComponent;
