import React from "react";

const Sidebar = () => {
  return (
    <div className="w-64 h-screen bg-blue-900 text-white fixed">

      <div className="p-4 text-xl font-bold">
        ScholarAdmin
      </div>

      <ul className="mt-4">

        <li className="p-3 hover:bg-blue-700 cursor-pointer">
          Dashboard
        </li>

        <li className="p-3 hover:bg-blue-700 cursor-pointer">
          Applications
        </li>

        <li className="p-3 hover:bg-blue-700 cursor-pointer">
          Scholarships
        </li>

        <li className="p-3 hover:bg-blue-700 cursor-pointer">
          Students
        </li>

      </ul>

    </div>
  );
};

export default Sidebar;