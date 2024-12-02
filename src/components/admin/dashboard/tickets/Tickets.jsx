import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Spinner, Button } from "flowbite-react";
import TicketDetails from "@/components/admin/dashboard/tickets/TicketDetails";
import ChatComponent from "@/components/admin/dashboard/tickets/ChatComponent";
import TicketList from "@/components/admin/dashboard/tickets/TicketList";
import toast from "react-hot-toast";

const Tickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [filterStatus, setFilterStatus] = useState("");
  const [selectedTask, setSelectedTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isChangingStatus, setIsChangingStatus] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await axios.get("/api/ticket/fetchTicket");
      setTickets(response.data.tickets);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching tickets:", error);
      toast.error("Failed to fetch tickets. Please try again.");
      setLoading(false);
    }
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSort = (field) => {
    if (field === sortField) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const handleFilter = (status) => {
    setFilterStatus(status);
  };

  const handleTicketClick = async (ticketId) => {
    setIsLoadingDetails(true);
    setIsModalOpen(true);
    try {
      const taskResponse = await axios.post("/api/ticket/ticket-taskDetails", {
        ticketId,
      });
      setSelectedTask(taskResponse.data);

      const chatResponse = await axios.post("/api/ticket/ticketChat", {
        ticketId,
      });
      setMessages(chatResponse.data.ticket.messages);
      setSelectedTicket(chatResponse.data.ticket);
    } catch (error) {
      console.error("Error fetching ticket details and chat:", error);
      toast.error("Failed to load ticket details. Please try again.");
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === "" || isSending) return;

    setIsSending(true);
    try {
      const response = await axios.post("/api/ticket/addMessage", {
        ticketId: selectedTicket._id,
        message: {
          content: newMessage,
          sender: "admin",
          sentAt: new Date().toISOString(),
        },
      });
      if (response.status === 201) {
        setMessages((prevMessages) => [...prevMessages, response.data.message]);
        toast.success("Message sent successfully");
        setNewMessage("");
      } else {
        toast.error("Failed to send message. Please try again.");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("An error occurred while sending the message.");
    } finally {
      setIsSending(false);
    }
  };

  const handleChangeTicketStatus = async () => {
    if (!selectedTicket) return;

    setIsChangingStatus(true);
    try {
      const endpoint = selectedTicket.isOpen
        ? "/api/ticket/closeTicket"
        : "/api/ticket/reOpenTicket";
      const response = await axios.post(endpoint, {
        ticketId: selectedTicket._id,
      });
      if (response.status === 201) {
        const newStatus = !selectedTicket.isOpen;
        toast.success(
          `Ticket ${newStatus ? "reopened" : "closed"} successfully`
        );
        setSelectedTicket({ ...selectedTicket, isOpen: newStatus });
        setTickets(
          tickets.map((ticket) =>
            ticket._id === selectedTicket._id
              ? { ...ticket, isOpen: newStatus }
              : ticket
          )
        );
      } else {
        toast.error(
          `Failed to ${
            selectedTicket.isOpen ? "close" : "reopen"
          } ticket. Please try again.`
        );
      }
    } catch (error) {
      console.error(
        `Error ${selectedTicket.isOpen ? "closing" : "reopening"} ticket:`,
        error
      );
      toast.error(
        `An error occurred while ${
          selectedTicket.isOpen ? "closing" : "reopening"
        } the ticket.`
      );
    } finally {
      setIsChangingStatus(false);
    }
  };

  const filteredTickets = tickets
    .filter(
      (ticket) =>
        ticket.ticketId.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (filterStatus === "" ||
          (filterStatus === "open" && ticket.isOpen) ||
          (filterStatus === "closed" && !ticket.isOpen))
    )
    .sort((a, b) => {
      if (a[sortField] < b[sortField]) return sortOrder === "asc" ? -1 : 1;
      if (a[sortField] > b[sortField]) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner size="xl" />
      </div>
    );

  return (
    <div className="space-y-6">
      <TicketList
        tickets={filteredTickets}
        searchTerm={searchTerm}
        handleSearch={handleSearch}
        handleSort={handleSort}
        handleFilter={handleFilter}
        sortField={sortField}
        sortOrder={sortOrder}
        handleTicketClick={handleTicketClick}
      />

      <Modal
        show={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        size="7xl"
      >
        <Modal.Header>
          <div className="flex items-center justify-between w-full gap-5">
            <span>Ticket Details</span>
            {selectedTicket && (
              <Button
                color={selectedTicket.isOpen ? "failure" : "success"}
                onClick={handleChangeTicketStatus}
                disabled={isChangingStatus}
              >
                {isChangingStatus
                  ? "Processing..."
                  : selectedTicket.isOpen
                  ? "Close Ticket"
                  : "Reopen Ticket"}
              </Button>
            )}
          </div>
        </Modal.Header>
        <Modal.Body>
          {isLoadingDetails ? (
            <div className="flex items-center justify-center h-64">
              <Spinner size="xl" />
            </div>
          ) : (
            <div className="flex flex-col md:flex-row">
              <div className="w-full pr-4 md:w-1/2">
                <h3 className="mb-2 text-lg font-semibold">Task Details</h3>
                <TicketDetails
                  selectedTask={selectedTask}
                  isTicketOpen={selectedTicket?.isOpen}
                />
              </div>
              <div className="w-full pl-4 border-l md:w-1/2">
                <h3 className="mb-2 text-lg font-semibold">Chat</h3>
                <ChatComponent
                  messages={messages}
                  newMessage={newMessage}
                  setNewMessage={setNewMessage}
                  handleSendMessage={handleSendMessage}
                  isSending={isSending}
                  isTicketOpen={selectedTicket?.isOpen}
                />
              </div>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Tickets;
