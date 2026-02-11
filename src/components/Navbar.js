import React from "react";
import { Link } from "react-router-dom";
import "../styles/Navbar.css";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="nav-wrapper">
        <div className="logo">
          🎓 ScholarHub
        </div>

        <ul className="nav-menu">
          <li><Link className="nav-link" to="/">Home</Link></li>
          <li><Link className="nav-link" to="/scholarships">Scholarships</Link></li>
          <li><Link className="nav-link" to="/about">About</Link></li>
          <li><Link className="nav-link" to="/contact">Contact</Link></li>
        </ul>

        <div className="nav-actions">
          <Link to="/login">
            <button className="btn btn-outline">Student Login</button>
          </Link>
          <Link to="/admin">
            <button className="btn btn-primary">Admin</button>
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
