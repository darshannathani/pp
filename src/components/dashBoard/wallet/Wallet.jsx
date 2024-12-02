"use client";

import React, { useState, useEffect , useCallback } from "react";
import {
  Card,
  Button,
  Table,
  Modal,
  Label,
  TextInput,
  Dropdown,
} from "flowbite-react";
import {
  FaWallet,
  FaArrowUp,
  FaArrowDown,
  FaHistory,
  FaDownload,
  FaFilter,
  FaSort,
} from "react-icons/fa";
import { createRazorpayOrder } from "@/_lib/razorpayOrder";
import axios from "axios";
import { useAppSelector } from "@/_lib/store/hooks";
import toast from "react-hot-toast";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

export default function Wallet() {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showAddFundsModal, setShowAddFundsModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [addFundsAmount, setAddFundsAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState("desc");
  const [filterDate, setFilterDate] = useState("");
  const [showFilterModal, setShowFilterModal] = useState(false);

  const { id } = useAppSelector((state) => state.userInfo);

  const fetchWalletBalance = useCallback(async () => {
    try {
      const response = await axios.post("/api/wallet/getBalance", {
        userId: id,
      });
      setBalance(response.data.wallet.balance);
    } catch (error) {
      console.error("Error fetching wallet balance:", error);
      toast.error("Failed to fetch wallet balance");
    } finally {
      setLoading(false);
    }
  },[id]);

  const fetchTransactions = useCallback(async () => {
    try {
      const response = await axios.post("/api/wallet/transactionHistory", {
        userId: id,
      });
      setTransactions(response.data.transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast.error("Failed to fetch transactions");
    }
  },[id]);

  useEffect(() => {
    fetchWalletBalance();
    fetchTransactions();
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [id , fetchTransactions , fetchWalletBalance]);

  

  const handleAddFunds = async () => {
    try {
      const amount = parseFloat(addFundsAmount) * 100; // Convert to paise
      if (isNaN(amount) || amount <= 0) {
        throw new Error("Invalid amount");
      }

      const order = await createRazorpayOrder(amount);

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: "INR",
        name: "Your Company Name",
        description: "Add Funds to Wallet",
        order_id: order.id,
        handler: async function (response) {
          try {
            await axios.post("/api/wallet/addMoney", {
              amount: amount / 100, // Convert back to rupees
              userId: id,
            });

            await fetchWalletBalance();
            await fetchTransactions();
            setShowAddFundsModal(false);
            setAddFundsAmount("");
            toast.success("Funds added successfully!");
          } catch (error) {
            console.error("Error processing payment:", error);
            toast.error("Error processing payment. Please try again.");
          }
        },
        prefill: {
          name: "User Name",
          email: "user@example.com",
          contact: "9999999999",
        },
        theme: {
          color: "#10B981",
        },
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.open();
    } catch (error) {
      console.error("Error creating Razorpay order:", error);
      toast.error(error.message);
    }
  };

  const handleWithdraw = async () => {
    try {
      const amount = parseFloat(withdrawAmount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error("Invalid withdrawal amount");
      }

      if (amount > balance) {
        throw new Error("Insufficient balance");
      }

      const response = await axios.post("/api/wallet/withdrawMoney", {
        amount,
        userId: id,
      });

      if (response.status === 201) {
        await fetchWalletBalance();
        await fetchTransactions();
        setShowWithdrawModal(false);
        setWithdrawAmount("");
        toast.success("Withdrawal successful!");
      } else {
        throw new Error("Withdrawal failed");
      }
    } catch (error) {
      console.error("Withdrawal failed:", error);
      toast.error(error.message || "Withdrawal failed. Please try again.");
    }
  };

  const handleSort = () => {
    const newOrder = sortOrder === "desc" ? "asc" : "desc";
    setSortOrder(newOrder);
    setTransactions(
      [...transactions].sort((a, b) => {
        return newOrder === "desc"
          ? new Date(b.createdAt) - new Date(a.createdAt)
          : new Date(a.createdAt) - new Date(b.createdAt);
      })
    );
  };

  const handleFilter = () => {
    if (filterDate) {
      const filteredTransactions = transactions.filter(
        (transaction) =>
          new Date(transaction.createdAt).toDateString() ===
          new Date(filterDate).toDateString()
      );
      setTransactions(filteredTransactions);
    } else {
      fetchTransactions();
    }
    setShowFilterModal(false);
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text("Transaction History", 20, 10);

    const tableColumn = ["Date", "Type", "Amount", "Status"];
    const tableRows = transactions.map((transaction) => [
      new Date(transaction.createdAt).toLocaleDateString(),
      transaction.direction,
      `₹${transaction.amount.toFixed(2)}`,
      transaction.status,
    ]);

    doc.autoTable(tableColumn, tableRows, { startY: 20 });
    doc.save("transactions.pdf");
    toast.success("PDF downloaded successfully!");
  };

  const downloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      transactions.map((t) => ({
        Date: new Date(t.createdAt).toLocaleDateString(),
        Type: t.direction,
        Amount: `₹${t.amount.toFixed(2)}`,
        Status: t.status,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");
    XLSX.writeFile(workbook, "transactions.xlsx");
    toast.success("Excel file downloaded successfully!");
  };

  const downloadCSV = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Date,Type,Amount,Status\n" +
      transactions
        .map(
          (t) =>
            `${new Date(t.createdAt).toLocaleDateString()},${
              t.direction
            },₹${t.amount.toFixed(2)},${t.status}`
        )
        .join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "transactions.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV file downloaded successfully!");
  };

  const SkeletonLoader = () => (
    <div className="space-y-4 animate-pulse">
      <div className="h-40 bg-gray-200 rounded-lg"></div>
      <div className="h-64 bg-gray-200 rounded-lg"></div>
    </div>
  );

  if (loading) {
    return (
      <div className="container max-w-4xl p-4 mx-auto">
        <SkeletonLoader />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl p-4 mx-auto">
      <h1 className="flex items-center mb-8 text-3xl font-bold text-gray-800 md:text-4xl">
        <FaWallet className="mr-4 text-blue-500" /> My Wallet
      </h1>

      <div className="space-y-8">
        <Card className="overflow-hidden transition-all duration-300 bg-white shadow-lg rounded-xl hover:shadow-xl">
          <div className="p-6 bg-gradient-to-r rounded-xl from-blue-500 to-blue-600">
            <h2 className="mb-2 text-xl font-semibold text-white">
              Available Balance
            </h2>
            <p className="text-4xl font-bold text-white">
              ₹{balance.toFixed(2)}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 p-6">
            <Button
              className="w-full text-white bg-green-500 hover:bg-green-600"
              onClick={() => setShowAddFundsModal(true)}
            >
              <FaArrowUp className="mr-2" /> Add Funds
            </Button>
            <Button
              className="w-full text-white bg-red-500 hover:bg-red-600"
              onClick={() => setShowWithdrawModal(true)}
            >
              <FaArrowDown className="mr-2" /> Withdraw
            </Button>
          </div>
        </Card>

        <Card className="overflow-hidden transition-all duration-300 bg-white shadow-lg rounded-xl hover:shadow-xl">
          <div className="p-6">
            <div className="flex flex-col mb-6 space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
              <h2 className="text-2xl font-semibold text-gray-800">
                <FaHistory className="inline mr-3 text-blue-500" /> Recent
                Transactions
              </h2>
              <div className="flex flex-wrap items-center gap-2">
                <Button size="sm" color="blue" onClick={handleSort}>
                  <FaSort className="mr-2" />{" "}
                  {sortOrder === "desc" ? "Oldest" : "Newest"}
                </Button>
                <Button
                  size="sm"
                  color="blue"
                  onClick={() => setShowFilterModal(true)}
                >
                  <FaFilter className="mr-2" /> Filter
                </Button>
                <Dropdown
                  label="Export"
                  dismissOnClick={false}
                  renderTrigger={() => (
                    <Button size="sm" color="blue">
                      <FaDownload className="mr-2" /> Export
                    </Button>
                  )}
                >
                  <Dropdown.Item onClick={downloadPDF}>
                    <FaDownload className="inline mr-2" /> Download as PDF
                  </Dropdown.Item>
                  <Dropdown.Item onClick={downloadExcel}>
                    <FaDownload className="inline mr-2" /> Download as Excel
                  </Dropdown.Item>
                  <Dropdown.Item onClick={downloadCSV}>
                    <FaDownload className="inline mr-2" /> Download as CSV
                  </Dropdown.Item>
                </Dropdown>
              </div>
            </div>
            <div className="overflow-x-auto">
              <Table hoverable>
                <Table.Head>
                  <Table.HeadCell>Date</Table.HeadCell>
                  <Table.HeadCell>Type</Table.HeadCell>
                  <Table.HeadCell>Amount</Table.HeadCell>
                  <Table.HeadCell>Status</Table.HeadCell>
                </Table.Head>
                <Table.Body className="divide-y">
                  {transactions.map((transaction) => (
                    <Table.Row
                      key={transaction._id}
                      className="bg-white hover:bg-gray-50"
                    >
                      <Table.Cell className="text-gray-600">
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </Table.Cell>
                      <Table.Cell>
                        <span
                          className={`flex items-center ${
                            transaction.direction === "credit"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {transaction.direction === "credit" ? (
                            <FaArrowUp className="mr-1" />
                          ) : (
                            <FaArrowDown className="mr-1" />
                          )}
                          {transaction.direction.charAt(0).toUpperCase() +
                            transaction.direction.slice(1)}
                        </span>
                      </Table.Cell>
                      <Table.Cell className="font-semibold text-gray-800">
                        ₹{transaction.amount.toFixed(2)}
                      </Table.Cell>
                      <Table.Cell>
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            transaction.status === "Completed"
                              ? "bg-green-100 text-green-800"
                              : transaction.status === "Pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {transaction.status}
                        </span>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            </div>
          </div>
        </Card>
      </div>

      {/* Add Funds Modal */}
      <Modal
        show={showAddFundsModal}
        onClose={() => setShowAddFundsModal(false)}
      >
        <Modal.Header>Add Funds to Wallet</Modal.Header>
        <Modal.Body>
          <div className="space-y-6">
            <div>
              <Label htmlFor="addFundsAmount" value="Amount (₹)" />
              <TextInput
                id="addFundsAmount"
                type="number"
                placeholder="Enter amount"
                value={addFundsAmount}
                onChange={(e) => setAddFundsAmount(e.target.value)}
                required
              />
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button color="green" onClick={handleAddFunds}>
            Add Funds
          </Button>
          <Button color="gray" onClick={() => setShowAddFundsModal(false)}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Withdraw Modal */}
      <Modal
        show={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
      >
        <Modal.Header>Withdraw Funds</Modal.Header>
        <Modal.Body>
          <div className="space-y-6">
            <div>
              <Label htmlFor="withdrawAmount" value="Amount (₹)" />
              <TextInput
                id="withdrawAmount"
                type="number"
                placeholder="Enter amount"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                required
              />
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button color="blue" onClick={handleWithdraw}>
            Confirm Withdrawal
          </Button>
          <Button color="gray" onClick={() => setShowWithdrawModal(false)}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Filter Modal */}
      <Modal show={showFilterModal} onClose={() => setShowFilterModal(false)}>
        <Modal.Header>Filter Transactions</Modal.Header>
        <Modal.Body>
          <div className="space-y-6">
            <div>
              <Label htmlFor="filterDate" value="Select Date" />
              <TextInput
                id="filterDate"
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              />
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button color="blue" onClick={handleFilter}>
            Apply Filter
          </Button>
          <Button color="gray" onClick={() => setShowFilterModal(false)}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
