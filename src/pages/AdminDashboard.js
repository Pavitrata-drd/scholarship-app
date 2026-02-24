import React from "react";
import Sidebar from "../components/admin/Sidebar";
import StatCard from "../components/admin/StatCard";
import ApplicationsChart from "../components/admin/ApplicationsChart";
import CategoryChart from "../components/admin/CategoryChart";
import RecentApplications from "../components/admin/RecentApplications";
import RecentActivity from "../components/admin/RecentActivity";
import ActiveScholarships from "../components/admin/ActiveScholarships";
const AdminDashboard = () => {
  return (
    <div className="flex">

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="ml-64 p-6 w-full bg-gray-100 min-h-screen">

        {/* Welcome Text */}
        <h1 className="text-3xl font-bold mb-6">
          Welcome back, Admin 👋
        </h1>

        {/* Stat Cards */}
        <div className="grid grid-cols-4 gap-6">

          <StatCard
            title="Total Applications"
            value="1,284"
            color="text-blue-600"
          />

          <StatCard
            title="Active Scholarships"
            value="38"
            color="text-yellow-600"
          />

          <StatCard
            title="Total Students"
            value="947"
            color="text-green-600"
          />

          <StatCard
            title="Pending Review"
            value="124"
            color="text-red-600"
          />

        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-2 gap-6 mt-6">
          {/* Applications and Activity */}

<div className="grid grid-cols-3 gap-6 mt-6">

  <div className="col-span-2">
    <RecentApplications />
  </div>

  <RecentActivity />

</div>

{/* Active Scholarships */}

<ActiveScholarships />

          <ApplicationsChart />

          <CategoryChart />

        </div>

      </div>

    </div>
  );
};

export default AdminDashboard;