import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import HistoryUser from "../../shared/history/History";
import AnalyticsData from "./AnalyticsData";

export default function Analytics() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const type = searchParams.get("type");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, [id, type]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return <div>{id && type ? <AnalyticsData /> : <HistoryUser />}</div>;
}