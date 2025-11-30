import React from "react";
import { Link } from "react-router-dom";

export default function App() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f0f16, #1b1b33)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: 20
    }}>
      <div style={{
        background: "#111827",
        padding: "40px 50px",
        borderRadius: 16,
        width: "100%",
        maxWidth: 420,
        textAlign: "center",
        boxShadow: "0 0 25px rgba(0,0,0,0.4)"
      }}>
        
        <h1 style={{ color: "#4cc9f0", marginBottom: 10 }}>
          Welcome to ChatSite
        </h1>

        <p style={{ color: "#cbd5e1", marginBottom: 25 }}>
          Select an option to continue
        </p>

        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: 15
        }}>
          <Link to="/login" style={btnStyle}>Login</Link>
          <Link to="/register" style={btnStyle}>Register</Link>
          <Link to="/rooms" style={btnStyle}>Chat Rooms</Link>
        </div>
      </div>
    </div>
  );
}

const btnStyle = {
  background: "#4cc9f0",
  padding: "12px 20px",
  borderRadius: 10,
  color: "#000",
  fontWeight: 600,
  textDecoration: "none",
  fontSize: 16
};
