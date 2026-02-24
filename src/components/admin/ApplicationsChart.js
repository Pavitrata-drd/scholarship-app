import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { month: "Jan", applications: 40 },
  { month: "Feb", applications: 60 },
  { month: "Mar", applications: 55 },
  { month: "Apr", applications: 75 },
  { month: "May", applications: 90 },
  { month: "Jun", applications: 65 },
];

const ApplicationsChart = () => {
  return (
    <div className="bg-white p-4 shadow rounded-lg">

      <h2 className="font-bold mb-4">
        Monthly Applications
      </h2>

      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />

          <Bar dataKey="applications" fill="#2563eb" />

        </BarChart>
      </ResponsiveContainer>

    </div>
  );
};

export default ApplicationsChart;