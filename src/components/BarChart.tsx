"use client";

import React, { useEffect, useState } from "react";
import {
  BarChart as BarGraph,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Bar,
} from "recharts";
import { db } from "@/lib/client";
import { collection, getDocs } from "firebase/firestore";

type Props = {};

export default function BarChart({}: Props) {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    fetchTotalRevenueByDayOfWeek().then((data) => {
      setChartData(data as any);
    });
  }, []);

  const fetchTotalRevenueByDayOfWeek = async () => {
    // Initialize days of the week with totals set to 0
    const days = [
      { name: "Domingo", total: 0 },
      { name: "Lunes", total: 0 },
      { name: "Martes", total: 0 },
      { name: "Miércoles", total: 0 },
      { name: "Jueves", total: 0 },
      { name: "Viernes", total: 0 },
      { name: "Sábado", total: 0 },
    ];

    const querySnapshot = await getDocs(collection(db, "orders"));

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.isActive) {
        return;
      }

      // Correctly split the date and time parts of the 'orderedAt' field
      const [datePart, timePart] = data.orderedAt.split(", "); // Note the space after the comma
      const [day, month, year] = datePart
        .split("/")
        .map((part: any) => parseInt(part, 10));

      // Adjust the month index by subtracting 1 as JavaScript months are 0-based
      const date = new Date(year, month - 1, day);
      const dayOfWeek = date.getDay(); // Get day of week, Sunday is 0

      if (days[dayOfWeek]) {
        // Ensure the dayOfWeek index exists in the days array
        days[dayOfWeek].total += data.total;
      }
    });

    return days;
  };

  return (
    <ResponsiveContainer width={"100%"} height={350}>
      <BarGraph data={chartData}>
        <XAxis
          dataKey={"name"}
          tickLine={false}
          axisLine={false}
          stroke="#888888"
          fontSize={12}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          stroke="#888888"
          fontSize={12}
          tickFormatter={(value) => `$${value}`}
        />
        <Bar dataKey={"total"} fill="#8884d8" radius={[4, 4, 0, 0]} />
      </BarGraph>
    </ResponsiveContainer>
  );
}
