import React from "react";
import "../styles/Navbar.css";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="logo">
        🎓 <span>ScholarHub</span>
      </div>

      <ul className="nav-links">
        <li><button className="nav-btn">Home</button></li>
        <li><button className="nav-btn">Scholarships</button></li>
        <li><button className="nav-btn">About</button></li>
        <li><button className="nav-btn">Contact</button></li>
      </ul>

      <div className="nav-actions">
        <button className="student-btn">Student Login</button>
        <button className="admin-btn">Admin</button>
      </div>
    </nav>
  );
}

export default Navbar;
