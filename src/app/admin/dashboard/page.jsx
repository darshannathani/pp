"use client";

import { useSearchParams } from "next/navigation";
import DefaultComponent from "@/components/dashBoard/default/Default";
import CreatorsList from "@/components/admin/dashboard/creators/CreatorsList";
import TestersList from "@/components/admin/dashboard/testers/TestersList";
import TasksList from "@/components/admin/dashboard/tasks/TasksList";
import TransactionList from "@/components/admin/dashboard/transactions/TransactionList";
import Tickets from "@/components/admin/dashboard/tickets/Tickets";
import Wallet from "@/components/admin/dashboard/wallet/Wallet";
import { Suspense } from "react";

// Map of components for different admin tabs
const componentsMap = {
  "creators-admin": CreatorsList,
  "testers-admin": TestersList,
  "tasks-admin": TasksList,
  "transactions-admin": TransactionList,
  "tickets-admin": Tickets,
  "wallet-admin": Wallet,
};

export default function Dashboard() {
  return (
    <div className="w-full mx-2">
      {/* Wrap entire logic that depends on useSearchParams with Suspense */}
      <Suspense fallback={<div>Loading...</div>}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}

// Separate the content that uses useSearchParams into its own component
function DashboardContent() {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("activeTab");

  // Determine which component to render based on the active tab
  let ComponentToRender = DefaultComponent;
  if (activeTab) {
    ComponentToRender = componentsMap[activeTab] || DefaultComponent;
  }

  return <ComponentToRender />;
}
