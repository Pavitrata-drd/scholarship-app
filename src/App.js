import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import ScholarshipList from "./pages/ScholarshipList";
import StudentDashboard from "./pages/StudentDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Register from "./pages/Register";

function App() {
  return (
    <Router>

      <Navbar />

      <Routes>

        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        {/* FIXED ROUTE */}
        <Route path="/student-dashboard" element={<StudentDashboard />} />

        <Route path="/scholarships" element={<ScholarshipList />} />

        <Route path="/admin" element={<AdminDashboard />} />

      </Routes>

    </Router>
  );
}

export default App;
