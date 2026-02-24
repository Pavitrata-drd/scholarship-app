import React, { useState, useEffect } from "react";
import "../styles/StudentDashboard.css";

export default function StudentDashboard() {

  const [form, setForm] = useState({
    name: "",
    phone: "",
    course: "",
    college: "",
    address: "",
    gender: "",
    dob: "",
    aadhaar: ""
  });

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [captcha, setCaptcha] = useState("");
  const [userCaptcha, setUserCaptcha] = useState("");

  // Generate captcha
  const generateCaptcha = () => {
    const chars =
      "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";

    let result = "";

    for (let i = 0; i < 6; i++) {
      result += chars.charAt(
        Math.floor(Math.random() * chars.length)
      );
    }

    setCaptcha(result);
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  // handle input change
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  // name validation
  const handleName = (e) => {
    const value = e.target.value;
    if (/^[A-Za-z ]*$/.test(value)) {
      setForm({ ...form, name: value });
    }
  };

  // phone validation
  const handlePhone = (e) => {
    const value = e.target.value;
    if (/^[0-9]*$/.test(value) && value.length <= 10) {
      setForm({ ...form, phone: value });
    }
  };

  // aadhaar validation
  const handleAadhaar = (e) => {
    const value = e.target.value;
    if (/^[0-9]*$/.test(value) && value.length <= 12) {
      setForm({ ...form, aadhaar: value });
    }
  };

  // OTP handler
  const handleOtpChange = (value, index) => {

    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  // Submit validation
  const handleSubmit = () => {

    if (
      !form.name ||
      !form.phone ||
      !form.course ||
      !form.college ||
      !form.address ||
      !form.gender ||
      !form.dob ||
      !form.aadhaar
    ) {
      alert("All fields are mandatory");
      return;
    }

    if (form.phone.length !== 10) {
      alert("Phone must be 10 digits");
      return;
    }

    if (form.aadhaar.length !== 12) {
      alert("Aadhaar must be 12 digits");
      return;
    }

    if (otp.join("").length !== 6) {
      alert("Enter complete OTP");
      return;
    }

    if (userCaptcha !== captcha) {
      alert("Invalid captcha");
      generateCaptcha();
      return;
    }

    alert("Registration Successful");
  };

  return (
    <div className="student-container">

      <h2>Students</h2>

      <div className="student-card">

        {/* LEFT FORM */}
        <div className="form-section">

          <h3>Application Form</h3>

          <label>Full Name *</label>
          <input
            value={form.name}
            onChange={handleName}
          />

          <label>Phone Number *</label>
          <input
            value={form.phone}
            onChange={handlePhone}
          />

          <label>Course *</label>
          <select
            name="course"
            value={form.course}
            onChange={handleChange}
          >
            <option value="">Select Course</option>
            <option>B.Tech</option>
            <option>BCA</option>
            <option>BSc</option>
            <option>MCA</option>
            <option>MBA</option>
          </select>

          <label>College *</label>
          <input
            name="college"
            value={form.college}
            onChange={handleChange}
          />

          <label>Address *</label>
          <textarea
            name="address"
            value={form.address}
            onChange={handleChange}
          />

          <label>Gender *</label>
          <select
            name="gender"
            value={form.gender}
            onChange={handleChange}
          >
            <option value="">Select</option>
            <option>Male</option>
            <option>Female</option>
          </select>

          <label>Date of Birth *</label>
          <input
            type="date"
            name="dob"
            value={form.dob}
            onChange={handleChange}
          />

          <label>Aadhaar Number *</label>
          <input
            value={form.aadhaar}
            onChange={handleAadhaar}
          />

          <label>Enter OTP *</label>

          <div className="otp-box">

            {otp.map((digit, index) => (

              <input
                key={index}
                id={`otp-${index}`}
                maxLength="1"
                value={digit}
                onChange={(e) =>
                  handleOtpChange(
                    e.target.value,
                    index
                  )
                }
              />

            ))}

          </div>

          <label>Captcha *</label>

          <div className="captcha-box">

            <span className="captcha-text">
              {captcha}
            </span>

            <button
              className="refresh-btn"
              onClick={generateCaptcha}
            >
              ↻
            </button>

          </div>

          <input
            placeholder="Enter captcha"
            value={userCaptcha}
            onChange={(e) =>
              setUserCaptcha(e.target.value)
            }
          />

          <button
            className="submit-btn"
            onClick={handleSubmit}
          >
            Submit Application
          </button>

        </div>

        {/* RIGHT SIDE */}
        <div className="tips-section">

          <h3>Student Login Tips</h3>

          <ul>

            <li>
              Student must read instructions carefully.
            </li>

            <li>
              Fill all required details carefully.
            </li>

            <li>
              Incorrect information may lead to rejection.
            </li>

            <li>
              Check details before submission.
            </li>

            <li>
              Keep your account secure.
            </li>

            <li>
              Do not share password.
            </li>

            <li>
              Use correct Aadhaar and OTP.
            </li>

          </ul>

        </div>

      </div>

    </div>
  );
}