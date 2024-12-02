import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table, TextInput, Dropdown, Badge, Card } from "flowbite-react";
import {
  HiSearch,
  HiFilter,
  HiSortAscending,
  HiSortDescending,
  HiCurrencyRupee,
  HiArrowUp,
  HiArrowDown,
  HiCash,
} from "react-icons/hi";

const TransactionList = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [filterDirection, setFilterDirection] = useState("");

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await axios.get("/api/admin/getAllTransection");
      setTransactions(response.data.transactions);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching transactions:", error);
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

  const handleFilter = (direction) => {
    setFilterDirection(direction);
  };

  const filteredTransactions = transactions
    .filter(
      (transaction) =>
        transaction.userId.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (filterDirection === "" || transaction.direction === filterDirection)
    )
    .sort((a, b) => {
      if (a[sortField] < b[sortField]) return sortOrder === "asc" ? -1 : 1;
      if (a[sortField] > b[sortField]) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

  const totalCredit = filteredTransactions.reduce((sum, transaction) => 
    transaction.direction === 'credit' ? sum + transaction.amount : sum, 0);
  const totalDebit = filteredTransactions.reduce((sum, transaction) => 
    transaction.direction === 'debit' ? sum + transaction.amount : sum, 0);
  const remainingBalance = totalCredit - totalDebit;

  const SkeletonLoader = () => (
    <div className="animate-pulse">
      <div className="w-3/4 h-4 mb-4 bg-gray-200 rounded"></div>
      <div className="h-4 mb-4 bg-gray-200 rounded"></div>
      <div className="w-5/6 h-4 mb-4 bg-gray-200 rounded"></div>
    </div>
  );

  if (loading) return <SkeletonLoader />;

  return (
    <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <div className="flex items-center">
            <HiArrowUp className="w-10 h-10 mr-4 text-green-500" />
            <div>
              <h5 className="mb-1 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                Total Credit
              </h5>
              <p className="font-normal text-gray-700 dark:text-gray-400">
                ₹{totalCredit.toFixed(2)}
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center">
            <HiArrowDown className="w-10 h-10 mr-4 text-red-500" />
            <div>
              <h5 className="mb-1 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                Total Debit
              </h5>
              <p className="font-normal text-gray-700 dark:text-gray-400">
                ₹{totalDebit.toFixed(2)}
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center">
            <HiCash className="w-10 h-10 mr-4 text-blue-500" />
            <div>
              <h5 className="mb-1 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                Remaining Balance
              </h5>
              <p className={`font-normal ${remainingBalance >= 0 ? 'text-green-600' : 'text-red-600'} dark:text-gray-400`}>
                ₹{remainingBalance.toFixed(2)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:space-y-0">
          <TextInput
            type="text"
            placeholder="Search by User ID..."
            value={searchTerm}
            onChange={handleSearch}
            icon={HiSearch}
            className="w-full md:w-1/3"
          />
          <div className="flex space-x-2">
            <Dropdown color={"blue"} label="Filter by Direction" icon={HiFilter}>
              <Dropdown.Item onClick={() => handleFilter("")}>
                All
              </Dropdown.Item>
              <Dropdown.Item onClick={() => handleFilter("credit")}>
                Credit
              </Dropdown.Item>
              <Dropdown.Item onClick={() => handleFilter("debit")}>
                Debit
              </Dropdown.Item>
            </Dropdown>
          </div>
        </div>

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
            <Table.HeadCell>Status</Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y">
            {filteredTransactions.map((transaction) => (
              <Table.Row
                key={transaction._id}
                className="bg-white dark:border-gray-700 dark:bg-gray-800"
              >
                <Table.Cell>
                  {new Date(transaction.createdAt).toLocaleString()}
                </Table.Cell>
                <Table.Cell>{transaction.userId}</Table.Cell>
                <Table.Cell>
                  <Badge
                    color={
                      transaction.direction === "credit" ? "success" : "failure"
                    }
                  >
                    {transaction.direction === "credit" ? "Credit" : "Debit"}
                  </Badge>
                </Table.Cell>
                <Table.Cell className="font-medium text-gray-900 dark:text-white">
                  <HiCurrencyRupee className="inline" />
                  {transaction.amount.toFixed(2)}
                </Table.Cell>
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

export default TransactionList;
