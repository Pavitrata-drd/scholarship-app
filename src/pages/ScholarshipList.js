import React from "react";

const ScholarshipList = () => {
  const scholarships = [
    {
      id: 1,
      name: "National Merit Scholarship",
      eligibility: "Undergraduate students with merit",
    },
  ];

  return (
  <div className="layout">

    {/* LEFT SIDEBAR */}
    <aside className="filters">
      <h3>Filters</h3>

      <label>
        <input type="checkbox" /> Engineering
      </label><br />

      <label>
        <input type="checkbox" /> Arts
      </label><br />

      <label>
        <input type="checkbox" /> Science
      </label>
    </aside>

    {/* RIGHT MAIN CONTENT */}
    <main>
      <h2>Available Scholarships</h2>

      {scholarships.length === 0 ? (
        <p>No scholarships available at the moment.</p>
      ) : (
        <>
          <div className="grid scholarships-grid">
            {scholarships.map((item) => (
              <div key={item.id} className="card">
                <span className="badge">Open</span>
                <h3>{item.name}</h3>
                <p>{item.eligibility}</p>
                <button className="button">View Details</button>
              </div>
            ))}
          </div>

          {/* Load More Button */}
          <div style={{ textAlign: "center", marginTop: "30px" }}>
            <button className="button">Load More</button>
          </div>
        </>
      )}
    </main>

  </div>
  );
};
  

export default ScholarshipList;
