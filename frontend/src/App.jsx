import React from "react";
import { Link } from "react-router-dom";

export default function App() {
  return (
    <div style={{ padding: 20 }}>
      <h1>Welcome to ChatSite</h1>

      <p>Select an option:</p>

      <ul style={{ lineHeight: "2rem" }}>
        <li><Link to="/login">Login</Link></li>
        <li><Link to="/register">Register</Link></li>
        <li><Link to="/rooms">Chat Rooms</Link></li>
      </ul>
    </div>
  );
}
