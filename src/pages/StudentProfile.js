import React, { useState } from "react";
import "../styles/StudentProfile.css";

export default function StudentProfile() {

  const [profile, setProfile] = useState({
    tenth: "",
    twelfth: "",
    income: "",
    category: "General",
  });

  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  // CORRECT handleSave function
  const handleSave = () => {

    // Check required fields
    if (!profile.tenth ||
        !profile.twelfth ||
        !profile.income) {

      alert("Please fill all academic details");
      return;
    }

    // Simulate document verification
    alert("Profile and documents submitted for verification");

    // AI suggestion logic
    if (profile.income <= 200000) {

      alert(
        "AI Suggestion: You are eligible for Government Scholarships like NSP, Post-Matric Scholarship."
      );

    } else if (profile.tenth >= 85 || profile.twelfth >= 85) {

      alert(
        "AI Suggestion: You are eligible for Merit-Based Scholarships."
      );

    } else {

      alert(
        "AI Suggestion: You are eligible for Private Scholarships."
      );
    }
  };

  return (

    <div className="profile-container">

      <div className="profile-card">

        <h2>Student Academic Profile</h2>

        <label>10th Percentage *</label>
        <input
          type="number"
          name="tenth"
          placeholder="Enter 10th percentage"
          value={profile.tenth}
          onChange={handleChange}
        />

        <label>12th Percentage *</label>
        <input
          type="number"
          name="twelfth"
          placeholder="Enter 12th percentage"
          value={profile.twelfth}
          onChange={handleChange}
        />

        <label>Family Income *</label>
        <input
          type="number"
          name="income"
          placeholder="Enter family income"
          value={profile.income}
          onChange={handleChange}
        />

        <label>Category *</label>
        <select
          name="category"
          value={profile.category}
          onChange={handleChange}
        >
          <option>General</option>
          <option>OBC</option>
          <option>SC</option>
          <option>ST</option>
        </select>

        <label>Upload 10th Marksheet *</label>
        <input type="file" accept=".pdf,.jpg,.png" />

        <label>Upload 12th Marksheet *</label>
        <input type="file" accept=".pdf,.jpg,.png" />

        <label>Upload Income Certificate *</label>
        <input type="file" accept=".pdf,.jpg,.png" />

        <label>Upload Aadhaar Card *</label>
        <input type="file" accept=".pdf,.jpg,.png" />

        <button
          className="save-btn"
          onClick={handleSave}
        >
          Save Profile
        </button>

      </div>

    </div>
  );
}