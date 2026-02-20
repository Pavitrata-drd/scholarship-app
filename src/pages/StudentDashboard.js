import React, { useState } from "react";
import "../styles/StudentDashboard.css";

function StudentDashboard() {

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    course: "",
    college: "",
    address: "",
    gender: "",
    dob: "",
    aadhar: "",
    captcha: ""
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Application Submitted Successfully");
  };

  return (

    <div className="dashboard-container">

      {/* Header */}
      <div className="dashboard-header">
        <h2>Students</h2>
      </div>

      {/* Main Card */}
      <div className="dashboard-card">

        {/* LEFT FORM */}
        <div className="form-section">

          <h3>Application Form</h3>

          <form onSubmit={handleSubmit}>

            <label>Full Name *</label>
            <input
              type="text"
              name="fullName"
              onChange={handleChange}
              required
            />

            <label>Phone Number *</label>
            <input
              type="text"
              name="phone"
              onChange={handleChange}
              required
            />

            <label>Course *</label>

<select
  name="course"
  onChange={handleChange}
  required
>

<option value="">Select Course</option>

<optgroup label="School">
<option>Class 9</option>
<option>Class 10</option>
<option>Class 11</option>
<option>Class 12</option>
</optgroup>

<optgroup label="Diploma">
<option>Diploma in Engineering</option>
<option>Diploma in Computer Science</option>
<option>Diploma in Mechanical Engineering</option>
<option>Diploma in Civil Engineering</option>
<option>Diploma in Electrical Engineering</option>
<option>Diploma in Electronics</option>
<option>Diploma in IT</option>
<option>Diploma in Nursing</option>
<option>Diploma in Pharmacy</option>
</optgroup>

<optgroup label="Undergraduate">
<option>B.Tech</option>
<option>B.E</option>
<option>BCA</option>
<option>BBA</option>
<option>B.Com</option>
<option>B.Sc</option>
<option>BA</option>
<option>MBBS</option>
<option>BDS</option>
<option>B.Pharm</option>
<option>B.Sc Nursing</option>
</optgroup>

<optgroup label="Postgraduate">
<option>M.Tech</option>
<option>MCA</option>
<option>MBA</option>
<option>M.Sc</option>
<option>M.Com</option>
<option>MA</option>
<option>M.Pharm</option>
</optgroup>

<optgroup label="Professional">
<option>CA</option>
<option>CS</option>
<option>CMA</option>
<option>LLB</option>
<option>LLM</option>
</optgroup>

<optgroup label="Doctorate">
<option>PhD</option>
</optgroup>

<optgroup label="ITI">
<option>ITI Electrician</option>
<option>ITI Fitter</option>
<option>ITI Welder</option>
<option>ITI Mechanic</option>
<option>ITI Computer Operator</option>
</optgroup>

</select>


            <label>College *</label>
            <input
              type="text"
              name="college"
              onChange={handleChange}
              required
            />

            <label>Address *</label>
            <textarea
              name="address"
              onChange={handleChange}
              required
            />

            <label>Gender *</label>
            <select
              name="gender"
              onChange={handleChange}
              required
            >
              <option value="">Select</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>

            <label>Date of Birth *</label>
            <input
              type="date"
              name="dob"
              onChange={handleChange}
              required
            />

            <label>Aadhaar Number *</label>
            <input
              type="text"
              name="aadhar"
              placeholder="Enter Aadhaar Number"
              onChange={handleChange}
              required
            />

            {/* OTP BOX STYLE */}
            <label>Enter OTP *</label>

            <div className="otp-box">
              <input maxLength="1"/>
              <input maxLength="1"/>
              <input maxLength="1"/>
              <input maxLength="1"/>
              <input maxLength="1"/>
              <input maxLength="1"/>
            </div>

            {/* CAPTCHA */}
            <label>Captcha *</label>

            <div className="captcha-box">
              <span className="captcha-text">YEsZ3L</span>
              <button type="button">↻</button>
            </div>

            <input
              type="text"
              name="captcha"
              placeholder="Enter Captcha Code"
              onChange={handleChange}
              required
            />

            <button className="submit-btn">
              Submit Application
            </button>

          </form>

        </div>

        {/* RIGHT INSTRUCTIONS */}
        <div className="instruction-section">

          <h3>Student Login Tips</h3>

          <ul>
            <li>Student must read instructions carefully.</li>
            <li>Fill all required details carefully.</li>
            <li>Incorrect information may lead to rejection.</li>
            <li>Check details before submission.</li>
            <li>Keep your account secure.</li>
            <li>Do not share password.</li>
            <li>Use correct Aadhaar and OTP.</li>
          </ul>

        </div>

      </div>

    </div>

  );
}

export default StudentDashboard;
