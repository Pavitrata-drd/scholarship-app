import React from "react";

const ActiveScholarships = () => {
  return (
    <div className="bg-white p-4 shadow rounded-lg mt-6">

      <h2 className="font-bold mb-4">
        Active Scholarships
      </h2>

      <div className="space-y-4">

        <div>
          <p>STEM Excellence Award</p>
          <div className="w-full bg-gray-200 h-3 rounded">
            <div className="bg-blue-600 h-3 rounded w-3/4"></div>
          </div>
        </div>

        <div>
          <p>Future Leaders Fund</p>
          <div className="w-full bg-gray-200 h-3 rounded">
            <div className="bg-green-600 h-3 rounded w-1/2"></div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default ActiveScholarships;