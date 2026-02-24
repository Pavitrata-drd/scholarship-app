import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "Merit", value: 400 },
  { name: "Financial", value: 300 },
  { name: "Sports", value: 200 },
  { name: "Other", value: 100 },
];

const COLORS = ["#2563eb", "#16a34a", "#f59e0b", "#ef4444"];

const CategoryChart = () => {
  return (
    <div className="bg-white p-4 shadow rounded-lg">

      <h2 className="font-bold mb-4">
        Scholarship Categories
      </h2>

      <ResponsiveContainer width="100%" height={250}>
        <PieChart>

          <Pie
            data={data}
            dataKey="value"
            innerRadius={60}
            outerRadius={90}
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={COLORS[index]} />
            ))}
          </Pie>

        </PieChart>
      </ResponsiveContainer>

    </div>
  );
};

export default CategoryChart;