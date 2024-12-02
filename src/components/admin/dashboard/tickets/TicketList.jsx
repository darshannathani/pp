import React from "react";
import { Table, TextInput, Dropdown, Badge, Card } from "flowbite-react";
import {
  HiSearch,
  HiFilter,
  HiSortAscending,
  HiSortDescending,
  HiClock,
} from "react-icons/hi";

const TicketList = ({
  tickets,
  searchTerm,
  handleSearch,
  handleSort,
  handleFilter,
  sortField,
  sortOrder,
  handleTicketClick,
}) => {
  return (
    <Card>
      <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:space-y-0">
        <TextInput
          type="text"
          placeholder="Search by Ticket ID..."
          value={searchTerm}
          onChange={handleSearch}
          icon={HiSearch}
          className="w-full md:w-1/3"
        />
        <div className="flex space-x-2">
          <Dropdown color="blue" label="Filter by Status" icon={HiFilter}>
            <Dropdown.Item onClick={() => handleFilter("")}>All</Dropdown.Item>
            <Dropdown.Item onClick={() => handleFilter("open")}>
              Open
            </Dropdown.Item>
            <Dropdown.Item onClick={() => handleFilter("closed")}>
              Closed
            </Dropdown.Item>
          </Dropdown>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table hoverable>
          <Table.Head>
            <Table.HeadCell
              className="cursor-pointer"
              onClick={() => handleSort("ticketId")}
            >
              Ticket ID{" "}
              {sortField === "ticketId" &&
                (sortOrder === "asc" ? (
                  <HiSortAscending className="inline" />
                ) : (
                  <HiSortDescending className="inline" />
                ))}
            </Table.HeadCell>
            <Table.HeadCell
              className="cursor-pointer"
              onClick={() => handleSort("taskId")}
            >
              Task ID{" "}
              {sortField === "taskId" &&
                (sortOrder === "asc" ? (
                  <HiSortAscending className="inline" />
                ) : (
                  <HiSortDescending className="inline" />
                ))}
            </Table.HeadCell>
            <Table.HeadCell
              className="cursor-pointer"
              onClick={() => handleSort("testerId")}
            >
              Tester ID{" "}
              {sortField === "testerId" &&
                (sortOrder === "asc" ? (
                  <HiSortAscending className="inline" />
                ) : (
                  <HiSortDescending className="inline" />
                ))}
            </Table.HeadCell>
            <Table.HeadCell
              className="cursor-pointer"
              onClick={() => handleSort("createdAt")}
            >
              Created At{" "}
              {sortField === "createdAt" &&
                (sortOrder === "asc" ? (
                  <HiSortAscending className="inline" />
                ) : (
                  <HiSortDescending className="inline" />
                ))}
            </Table.HeadCell>
            <Table.HeadCell>Status</Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y">
            {tickets.map((ticket) => (
              <Table.Row
                key={ticket._id}
                className="bg-white cursor-pointer dark:border-gray-700 dark:bg-gray-800 hover:bg-gray-50"
                onClick={() => handleTicketClick(ticket.ticketId)}
              >
                <Table.Cell className="font-medium text-gray-900 dark:text-white">
                  {ticket.ticketId}
                </Table.Cell>
                <Table.Cell>{ticket.taskId}</Table.Cell>
                <Table.Cell>{ticket.testerId}</Table.Cell>
                <Table.Cell>
                  <div className="flex items-center">
                    <HiClock className="mr-2 text-gray-500" />
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <Badge color={ticket.isOpen ? "success" : "failure"}>
                    {ticket.isOpen ? "Open" : "Closed"}
                  </Badge>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>
    </Card>
  );
};

export default TicketList;
