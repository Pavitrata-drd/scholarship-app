import React, { useState } from "react";
import axios from "axios";
import "../styles/Login.css";

function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {

    try {

      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password
      });

      alert("Login successful");

      // save token
      localStorage.setItem("token", res.data.token);

      // redirect
      window.location.href = "/student-dashboard";

    } catch (error) {

      alert("Invalid email or password");

    }

  };


  return (

    <div className="login-page">

      <div className="login-glass-container">

        <div className="login-card">

          <div className="login-left">
            <h2>Welcome Back 👋</h2>
            <p>Login with your personal information</p>
          </div>


          <div className="login-right">

            <h2>Login</h2>

            <input
              type="email"
              placeholder="Email"
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="password"
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
            />

            <button onClick={handleLogin}>
              SIGN IN
            </button>

            <p>
              Forgot password?
              <span onClick={() => window.location.href="/forgot"}>
                Reset
              </span>
            </p>

            <p>
              New student?
              <span onClick={() => window.location.href="/register"}>
                Register
              </span>
            </p>

          </div>

        </div>

      </div>

    </div>

  );
}

export default Login;
