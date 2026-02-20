import React, { useState } from "react";
import axios from "axios";

function Register() {

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async () => {

    try {

      const res = await axios.post(
        "http://localhost:5000/api/auth/register",
        {
          name,
          email,
          password
        }
      );

      alert(res.data.message);

      window.location.href = "/login";

    } catch (error) {

      alert(error.response?.data?.message || "Registration failed");

    }

  };

  return (

    <div style={{
      display:"flex",
      justifyContent:"center",
      alignItems:"center",
      height:"90vh",
      background:"linear-gradient(to right,#4e73df,#8e44ad)"
    }}>

      <div style={{
        width:"350px",
        background:"white",
        padding:"25px",
        borderRadius:"10px"
      }}>

        <h2>Student Register</h2>

        <input
          type="text"
          placeholder="Full Name"
          onChange={(e)=>setName(e.target.value)}
          style={{width:"100%",padding:"10px",marginBottom:"10px"}}
        />

        <input
          type="email"
          placeholder="Email"
          onChange={(e)=>setEmail(e.target.value)}
          style={{width:"100%",padding:"10px",marginBottom:"10px"}}
        />

        {/* PASSWORD WITH EYE ICON */}

        <div style={{position:"relative"}}>

          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            onChange={(e)=>setPassword(e.target.value)}
            style={{
              width:"100%",
              padding:"10px",
              marginBottom:"10px"
            }}
          />

          <span
            onClick={()=>setShowPassword(!showPassword)}
            style={{
              position:"absolute",
              right:"10px",
              top:"10px",
              cursor:"pointer"
            }}
          >
            {showPassword ? "🙈" : "👁️"}
          </span>

        </div>

        <button
          onClick={handleRegister}
          style={{
            width:"100%",
            padding:"10px",
            background:"linear-gradient(to right,#4e73df,#8e44ad)",
            color:"white",
            border:"none"
          }}
        >
          Register
        </button>

      </div>

    </div>

  );

}

export default Register;
