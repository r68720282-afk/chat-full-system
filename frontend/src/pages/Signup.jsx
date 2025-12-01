import React from "react";
import { Link } from "react-router-dom";

export default function Signup() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg,#03050b,#08121d)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        color: "#fff",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 380,
          background: "rgba(255,255,255,0.05)",
          padding: 30,
          borderRadius: 16,
          boxShadow: "0 0 40px rgba(0,0,0,0.5)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: 25 }}>Create Account</h2>

        <input
          type="text"
          placeholder="Username"
          style={inputStyle}
        />
        <input
          type="email"
          placeholder="Email"
          style={inputStyle}
        />
        <input
          type="password"
          placeholder="Password"
          style={inputStyle}
        />

        <button
          style={{
            width: "100%",
            padding: "12px 0",
            background: "#00e1ff",
            border: "none",
            fontWeight: 700,
            borderRadius: 10,
            marginTop: 10,
          }}
        >
          Sign Up
        </button>

        <p style={{ marginTop: 20, textAlign: "center", opacity: 0.7 }}>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  marginBottom: 12,
  padding: "12px 12px",
  borderRadius: 8,
  border: "1px solid rgba(255,255,255,0.1)",
  background: "rgba(255,255,255,0.07)",
  color: "#fff",
};
