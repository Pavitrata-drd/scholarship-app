import React from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    // temporary (backend later)
    navigate("/student");
  };

  return (
    <div style={{
      display: "flex",
      height: "100vh",
      justifyContent: "center",
      alignItems: "center",
      background: "#f3f4f6"
    }}>
      <form
        onSubmit={handleLogin}
        style={{
          background: "white",
          padding: "40px",
          borderRadius: "10px",
          width: "300px",
          boxShadow: "0 10px 20px rgba(0,0,0,0.1)"
        }}
      >
        <h2 style={{ marginBottom: "20px" }}>Student Login</h2>

        <input
          type="email"
          placeholder="Email"
          required
          style={{ width: "100%", marginBottom: "12px", padding: "8px" }}
        />

        <input
          type="password"
          placeholder="Password"
          required
          style={{ width: "100%", marginBottom: "20px", padding: "8px" }}
        />

        <button
          style={{
            width: "100%",
            background: "#6366f1",
            color: "white",
            padding: "10px",
            border: "none",
            borderRadius: "6px"
          }}
        >
          Login
        </button>
      </form>
    </div>
  );
}

export default Login;
