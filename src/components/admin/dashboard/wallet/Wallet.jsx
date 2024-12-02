import React, { useState, useEffect } from "react";
import axios from "axios";
import { Card, Table, Badge } from "flowbite-react";
import {
  HiCurrencyRupee,
  HiArrowUp,
  HiArrowDown,
  HiSortAscending,
  HiSortDescending,
} from "react-icons/hi";

const Wallet = () => {
  const [walletData, setWalletData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      const response = await axios.get("/api/admin/wallet");
      setWalletData(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching wallet data:", error);
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleSort = (field) => {
    if (field === sortField) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const sortedTransactions = walletData?.transactions.sort((a, b) => {
    if (a[sortField] < b[sortField]) return sortOrder === "asc" ? -1 : 1;
    if (a[sortField] > b[sortField]) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const SkeletonLoader = () => (
    <div className="animate-pulse">
      <div className="h-32 mb-4 bg-gray-200 rounded"></div>
      <div className="h-64 bg-gray-200 rounded"></div>
    </div>
  );

  if (loading) {
    return <SkeletonLoader />;
  }

  return (
    <div className="p-4 space-y-4">
      <Card>
        <div className="flex items-center justify-between">
          <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            System Wallet
          </h5>
          <Badge color="success" size="xl" icon={HiCurrencyRupee}>
            Balance: ₹{walletData.wallet[0].balance.toFixed(2)}
          </Badge>
        </div>
        <p className="font-normal text-gray-700 dark:text-gray-400">
          Last updated: {formatDate(walletData.wallet[0].updatedAt)}
        </p>
      </Card>

      <Card>
        <h5 className="mb-4 text-xl font-bold tracking-tight text-gray-900 dark:text-white">
          Recent Transactions
        </h5>
        <Table hoverable>
          <Table.Head>
            <Table.HeadCell
              className="cursor-pointer"
              onClick={() => handleSort("createdAt")}
            >
              Date{" "}
              {sortField === "createdAt" &&
                (sortOrder === "asc" ? (
                  <HiSortAscending className="inline" />
                ) : (
                  <HiSortDescending className="inline" />
                ))}
            </Table.HeadCell>
            <Table.HeadCell
              className="cursor-pointer"
              onClick={() => handleSort("userId")}
            >
              User ID{" "}
              {sortField === "userId" &&
                (sortOrder === "asc" ? (
                  <HiSortAscending className="inline" />
                ) : (
                  <HiSortDescending className="inline" />
                ))}
            </Table.HeadCell>
            <Table.HeadCell
              className="cursor-pointer"
              onClick={() => handleSort("direction")}
            >
              Type{" "}
              {sortField === "direction" &&
                (sortOrder === "asc" ? (
                  <HiSortAscending className="inline" />
                ) : (
                  <HiSortDescending className="inline" />
                ))}
            </Table.HeadCell>
            <Table.HeadCell
              className="cursor-pointer"
              onClick={() => handleSort("amount")}
            >
              Amount{" "}
              {sortField === "amount" &&
                (sortOrder === "asc" ? (
                  <HiSortAscending className="inline" />
                ) : (
                  <HiSortDescending className="inline" />
                ))}
            </Table.HeadCell>
            <Table.HeadCell
              className="cursor-pointer"
              onClick={() => handleSort("status")}
            >
              Status{" "}
              {sortField === "status" &&
                (sortOrder === "asc" ? (
                  <HiSortAscending className="inline" />
                ) : (
                  <HiSortDescending className="inline" />
                ))}
            </Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y">
            {sortedTransactions.map((transaction) => (
              <Table.Row
                key={transaction._id}
                className="bg-white dark:border-gray-700 dark:bg-gray-800"
              >
                <Table.Cell>{formatDate(transaction.createdAt)}</Table.Cell>
                <Table.Cell>{transaction.userId}</Table.Cell>
                <Table.Cell>
                  <Badge
                    color={
                      transaction.direction === "credit" ? "success" : "failure"
                    }
                    icon={
                      transaction.direction === "credit"
                        ? HiArrowUp
                        : HiArrowDown
                    }
                  >
                    {transaction.direction === "credit" ? "Credit" : "Debit"}
                  </Badge>
                </Table.Cell>
                <Table.Cell>₹{transaction.amount.toFixed(2)}</Table.Cell>
                <Table.Cell>
                  <Badge
                    color={
                      transaction.status === "Completed" ? "success" : "warning"
                    }
                  >
                    {transaction.status}
                  </Badge>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </Card>
    </div>
  );
};

export default Wallet;
