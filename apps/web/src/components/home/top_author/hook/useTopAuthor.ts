

import { fetchTopAuthors, TopAuthor, Period } from "@/app/api/services/HomeService";
import { useEffect, useState } from "react";

export function useTopAuthor() {
    const [period, setPeriod] = useState<Period>("7d");
    const [authors, setAuthors] = useState<TopAuthor[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await fetchTopAuthors(period, 5);
        setAuthors(data);
      } catch (error) {
        console.error("Error loading top authors:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [period]);


  const periods = [
    { id: "7d", label: "7 days" },
    { id: "30d", label: "30 days" },
    { id: "1y", label: "1 year" },
  ];

    return {
        state: {
            period,
            authors,
            loading,
        },
        handlers: {
            setPeriod,
            periods
        }
    };
}