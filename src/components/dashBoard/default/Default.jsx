import { Card } from "flowbite-react";
import { useAppSelector } from "@/_lib/store/hooks";
import { HiChartPie } from "react-icons/hi";
import { FaTasks, FaHistory, FaUsers } from "react-icons/fa";
import { IoWallet, IoTicket } from "react-icons/io5";
import { MdAssignment, MdReviews } from "react-icons/md";
import { CgProfile } from "react-icons/cg";
import Link from "next/link";
import { GiReceiveMoney } from "react-icons/gi";

export default function DefaultComponent() {
  const role = useAppSelector((state) => state.userInfo.role);

  const getCards = () => {
    if (role === "admin") {
      return [
        {
          href: "/admin/dashboard?activeTab=creators-admin",
          label: "Creators",
          icon: CgProfile,
          description: "Manage creator accounts and activities.",
        },
        {
          href: "/admin/dashboard?activeTab=testers-admin",
          label: "Testers",
          icon: FaUsers,
          description: "Oversee tester profiles and performances.",
        },
        {
          href: "/admin/dashboard?activeTab=tasks-admin",
          label: "Tasks",
          icon: MdAssignment,
          description: "Monitor and manage all tasks in the system.",
        },
        {
          href: "/admin/dashboard?activeTab=transactions-admin",
          label: "Transactions",
          icon: GiReceiveMoney,
          description: "View and manage all financial transactions.",
        },
        {
          href: "/admin/dashboard?activeTab=tickets-admin",
          label: "Tickets",
          icon: IoTicket,
          description: "Handle support tickets and inquiries.",
        },
        {
          href: "/admin/dashboard?activeTab=wallet-admin",
          label: "Wallet",
          icon: IoWallet,
          description: "Manage system-wide wallet operations.",
        },
      ];
    }

    const commonCards = [
      {
        href: "/dashboard?activeTab=history",
        label: "History",
        icon: FaHistory,
        description: "View your activity history.",
      },
      {
        href: "/dashboard?activeTab=wallet",
        label: "Wallet",
        icon: IoWallet,
        description: "Manage your wallet and transactions.",
      },
      {
        href: "/dashboard?activeTab=ticket",
        label: "Tickets",
        icon: IoTicket,
        description: "Generate and manage tickets.",
      },
      {
        href: "/dashboard?activeTab=profile",
        label: "Manage Profile",
        icon: CgProfile,
        description: "Update your profile information.",
      },
    ];

    const roleSpecificCards =
      role === "tester"
        ? [
            {
              href: "/dashboard?activeTab=available-task",
              label: "Available Tasks",
              icon: FaTasks,
              description: "View tasks that are available for you to take up.",
            },
            {
              href: "/dashboard?activeTab=applied-task",
              label: "Applied Tasks",
              icon: FaTasks,
              description: "View the tasks you've applied for.",
            },
            {
              href: "/dashboard?activeTab=result-tester",
              label: "Results",
              icon: HiChartPie,
              description: "Check your test results and performance.",
            },
          ]
        : role === "creator"
        ? [
            {
              href: "/dashboard?activeTab=analytics",
              label: "Analytics",
              icon: HiChartPie,
              description: "Get insights for your tasks.",
            },
            {
              href: "/dashboard?activeTab=add-task",
              label: "Add Task",
              icon: FaTasks,
              description: "Create new tasks for testers.",
            },
            {
              href: "/dashboard?activeTab=ongoing-task",
              label: "Ongoing Tasks",
              icon: FaTasks,
              description: "Manage tasks that are currently ongoing.",
            },
            {
              href: "/dashboard?activeTab=review-creator",
              label: "Review",
              icon: MdReviews,
              description:
                "View results related to the tasks you have created.",
            },
          ]
        : [];

    return [...roleSpecificCards, ...commonCards];
  };

  const cards = getCards();

  return (
    <div className="grid grid-cols-1 gap-6 p-8 md:grid-cols-2 lg:grid-cols-3">
      {cards.length === 0 ? (
        <div className="flex items-center justify-center p-6 bg-gray-100 rounded-lg col-span-full">
          <p className="text-lg text-gray-600">
            No options available for your role.
          </p>
        </div>
      ) : (
        cards.map((card, index) => (
          <Card
            key={index}
            className="p-6 transition-transform transform shadow-lg hover:scale-105"
          >
            <div className="flex items-center mb-4">
              <card.icon size={24} className="mr-3 text-blue-500" />
              <h5 className="text-xl font-semibold text-gray-900">
                {card.label}
              </h5>
            </div>
            <p className="mb-4 text-gray-700">{card.description}</p>
            <Link className="text-blue-500 hover:underline" href={card.href}>
              Go to {card.label}
            </Link>
          </Card>
        ))
      )}
    </div>
  );
}
