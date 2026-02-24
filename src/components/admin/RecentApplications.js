import React from "react";

const RecentApplications = () => {

  const applications = [
    {
      name: "Pavi",
      scholarship: "STEM Excellence Award",
      date: "2026-02-10",
      status: "Approved",
    },
    {
      name: "Brinda",
      scholarship: "Future Leaders Fund",
      date: "2026-02-12",
      status: "Pending",
    },
    {
      name: "Jemimah",
      scholarship: "Global Diversity Grant",
      date: "2026-02-14",
      status: "Rejected",
    },
  ];

  return (
    <div className="bg-white p-4 shadow rounded-lg">

      <h2 className="font-bold mb-4">
        Recent Applications
      </h2>

      <table className="w-full">

        <thead>
          <tr className="text-left border-b">
            <th>Name</th>
            <th>Scholarship</th>
            <th>Date</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {applications.map((app, index) => (
            <tr key={index} className="border-b">

              <td>{app.name}</td>

              <td>{app.scholarship}</td>

              <td>{app.date}</td>

              <td>
                <span className={
                  app.status === "Approved"
                    ? "text-green-600"
                    : app.status === "Pending"
                    ? "text-yellow-600"
                    : "text-red-600"
                }>
                  {app.status}
                </span>
              </td>

            </tr>
          ))}
        </tbody>

      </table>

    </div>
  );
};

export default RecentApplications;