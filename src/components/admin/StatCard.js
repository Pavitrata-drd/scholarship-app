import React from "react";

const StatCard = ({ title, value, color }) => {
  return (
    <div className="bg-white shadow rounded-lg p-4">
      <p className="text-gray-500">{title}</p>
      <h2 className={`text-2xl font-bold ${color}`}>
        {value}
      </h2>
    </div>
  );
};

export default StatCard;