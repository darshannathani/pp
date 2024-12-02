import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Table,
  Button,
  Spinner,
  TextInput,
  Select,
  Modal,
} from "flowbite-react";
import {
  FaSort,
  FaCheck,
  FaTimes,
  FaSearch,
  FaFilter,
  FaArrowLeft,
  FaDownload,
} from "react-icons/fa";
import { useSearchParams, useRouter } from "next/navigation";
import { useAppSelector } from "@/_lib/store/hooks";
import toast from "react-hot-toast";

export default function ApproveDisapprove() {
  const [testerDetails, setTesterDetails] = useState([]);
  const [selectedTesterDetails, setSelectedTesterDetails] = useState([]);
  const [rejectedTesterDetails, setRejectedTesterDetails] = useState([]);
  const [filteredTesters, setFilteredTesters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortColumn, setSortColumn] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");
  const [searchTerm, setSearchTerm] = useState("");
  const [ageFilter, setAgeFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState({ type: "", testerId: "" });
  const [activeView, setActiveView] = useState("applied");

  const searchParams = useSearchParams();
  const router = useRouter();
  const taskId = searchParams.get("taskId");
  const taskType = searchParams.get("taskType");
  const creatorId = useAppSelector((state) => state.userInfo.id);

  const fetchTesterList = useCallback(async () => {
    try {
      let endpoint = "";
      const responseApprovedDisapproved = await axios.post(
        "/api/task/approved-disapproved",
        {
          taskId,
          taskType,
        }
      );

      setSelectedTesterDetails(
        responseApprovedDisapproved.data.selectedTesters
      );

      setRejectedTesterDetails(
        responseApprovedDisapproved.data.rejectedTesters
      );

      if (taskType === "AppTask") {
        endpoint = "/api/task/app/applied-tester-list";
      } else if (taskType === "MarketingTask") {
        endpoint = "/api/task/marketing/applied-tester-list";
      } else {
        throw new Error("Invalid task type");
      }

      const response = await axios.post(endpoint, {
        taskId,
        creatorId,
      });

      setTesterDetails(response.data.testerDetails);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching tester list:", error);
      setLoading(false);
      toast.error("Failed to fetch tester list");
    }
  }, [taskId, taskType, creatorId]);

  useEffect(() => {
    fetchTesterList();
  }, [fetchTesterList]);

  // Memoize the filterTesters function using useCallback
  const filterTesters = useCallback(() => {
    let dataToFilter = [];
    switch (activeView) {
      case "applied":
        dataToFilter = testerDetails;
        break;
      case "accepted":
        dataToFilter = selectedTesterDetails;
        break;
      case "rejected":
        dataToFilter = rejectedTesterDetails;
        break;
      default:
        dataToFilter = testerDetails;
    }

    let filtered = dataToFilter.filter(
      (tester) =>
        tester.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tester.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (ageFilter) {
      filtered = filtered.filter(
        (tester) => tester.age.toString() === ageFilter
      );
    }

    setFilteredTesters(filtered);
  }, [
    searchTerm,
    ageFilter,
    testerDetails,
    selectedTesterDetails,
    rejectedTesterDetails,
    activeView,
  ]);

  useEffect(() => {
    filterTesters();
  }, [filterTesters]);

  const handleSort = (column) => {
    const newDirection =
      sortColumn === column && sortDirection === "asc" ? "desc" : "asc";
    setSortColumn(column);
    setSortDirection(newDirection);

    const sorted = [...filteredTesters].sort((a, b) => {
      if (a[column] < b[column]) return newDirection === "asc" ? -1 : 1;
      if (a[column] > b[column]) return newDirection === "asc" ? 1 : -1;
      return 0;
    });

    setFilteredTesters(sorted);
  };

  const handleApproveDisapprove = (testerId, action) => {
    setModalAction({ type: action, testerId });
    setShowModal(true);
  };

  const confirmAction = async () => {
    const { type: action, testerId } = modalAction;
    setShowModal(false);
    setLoading(true);

    try {
      let endpoint = "";

      if (taskType === "AppTask") {
        endpoint = `/api/task/app/${action}`;
      } else if (taskType === "MarketingTask") {
        endpoint = `/api/task/marketing/${action}`;
      } else {
        throw new Error("Invalid task type");
      }
      const responseApplied = await axios.post(endpoint, {
        testerId,
        taskId,
        creatorId,
      });

      if (responseApplied.status === 200) {
        await fetchTesterList();
        toast.success(
          `Tester ${action === "approve" ? "approved" : "disapproved"
          } successfully!`
        );
      } else {
        toast.error(`Problem ${action}ing tester`);
      }
    } catch (error) {
      console.error(`Error ${action}ing tester:`, error);
      toast.error(`Error ${action}ing tester`);
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    router.back();
  };

  const downloadCSV = () => {
    const headers = ["Name", "Email", "Age"];
    const csvContent = [
      headers.join(","),
      ...filteredTesters.map((tester) =>
        [tester.name, tester.email, tester.age].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `${activeView}_testers.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner size="xl" />
      </div>
    );
  }

  return (
    <div className="container p-6 mx-auto bg-white rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-gray-800">
          Tester Approval List
        </h2>
        <Button color="light" onClick={goBack}>
          <FaArrowLeft className="mr-2" /> Back
        </Button>
      </div>
      <div className="flex flex-wrap items-center justify-between mb-4 space-y-2 md:space-y-0">
        <div className="flex items-center w-full space-x-2 md:w-auto">
          <Select
            value={activeView}
            onChange={(e) => setActiveView(e.target.value)}
          >
            <option value="applied">Applied Testers</option>
            <option value="accepted">Accepted Testers</option>
            <option value="rejected">Rejected Testers</option>
          </Select>
          <TextInput
            type="text"
            placeholder="Search by name or email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={FaSearch}
          />
          <Select
            value={ageFilter}
            onChange={(e) => setAgeFilter(e.target.value)}
          >
            <option value="">All Ages</option>
            {[...new Set(filteredTesters.map((t) => t.age))]
              .sort((a, b) => a - b)
              .map((age) => (
                <option key={age} value={age}>
                  {age}
                </option>
              ))}
          </Select>
        </div>
        <div className="flex items-center space-x-2">
          <Button color="light" onClick={downloadCSV}>
            <FaDownload className="mr-2" /> Download CSV
          </Button>
        </div>
      </div>
      <Table hoverable className="w-full">
        <Table.Head>
          <Table.HeadCell>
            Name{" "}
            <FaSort
              className="cursor-pointer"
              onClick={() => handleSort("name")}
            />
          </Table.HeadCell>
          <Table.HeadCell>
            Email{" "}
            <FaSort
              className="cursor-pointer"
              onClick={() => handleSort("email")}
            />
          </Table.HeadCell>
          <Table.HeadCell>
            Age{" "}
            <FaSort
              className="cursor-pointer"
              onClick={() => handleSort("age")}
            />
          </Table.HeadCell>
          <Table.HeadCell>Actions</Table.HeadCell>
        </Table.Head>
        <Table.Body>
          {filteredTesters.map((tester) => (
            <Table.Row key={tester.id}>
              <Table.Cell>{tester.name}</Table.Cell>
              <Table.Cell>{tester.email}</Table.Cell>
              <Table.Cell>{tester.age}</Table.Cell>
              <Table.Cell className="flex">
                <Button
                  color="green"
                  onClick={() => handleApproveDisapprove(tester.id, "approve")}
                >
                  <FaCheck className="mr-2" /> Approve
                </Button>
                <Button
                  color="red"
                  className="ml-2"
                  onClick={() =>
                    handleApproveDisapprove(tester.id, "disapprove")
                  }
                >
                  <FaTimes className="mr-2" /> Disapprove
                </Button>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>

      <Modal show={showModal} onClose={() => setShowModal(false)}>
        <Modal.Header>Confirm Action</Modal.Header>
        <Modal.Body>
          Are you sure you want to{" "}
          {modalAction.type === "approve" ? "approve" : "disapprove"} this
          tester?
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={confirmAction}>Yes</Button>
          <Button color="gray" onClick={() => setShowModal(false)}>
            No
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
