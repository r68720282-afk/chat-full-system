import React from "react";
import { Link } from "react-router-dom";
import "./hero.css"; // hover animation css

export default function App() {
  return (
    <div style={styles.page}>
      {/* HERO SECTION */}
      <div style={styles.heroWrapper}>
        <h1 style={styles.title}>
          Welcome to <span style={styles.brand}>ChatSite</span>
        </h1>

        <p style={styles.subtitle}>
          Connect with people instantly. Rooms, DMs, Levels, XP — All in one platform.
        </p>

        <div style={styles.buttons}>
          <Link to="/login" className="btn-primary" style={styles.buttonPrimary}>
            Login
          </Link>

          <Link to="/signup" className="btn-secondary" style={styles.buttonSecondary}>
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}

/* STYLES */
const styles = {
  page: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
    minHeight: "100vh",
    background: "#0f0f0f",
    color: "white",
    padding: "20px",
    textAlign: "center",
  },

  heroWrapper: {
    maxWidth: "700px",
  },

  title: {
    fontSize: "48px",
    fontWeight: "700",
    marginBottom: "10px",
  },

  brand: {
    color: "#00e1ff",
    textShadow: "0 0 10px #00e1ff",
  },

  subtitle: {
    fontSize: "18px",
    color: "#bbbbbb",
    marginBottom: "30px",
    lineHeight: "1.6",
  },

  buttons: {
    display: "flex",
    gap: "20px",
    justifyContent: "center",
    marginTop: "20px",
  },

  buttonPrimary: {
    padding: "12px 28px",
    background: "#00e1ff",
    color: "#000",
    borderRadius: "8px",
    fontWeight: "600",
    textDecoration: "none",
    transition: "0.25s",
  },

  buttonSecondary: {
    padding: "12px 28px",
    background: "transparent",
    border: "2px solid #00e1ff",
    borderRadius: "8px",
    color: "#00e1ff",
    fontWeight: "600",
    textDecoration: "none",
    transition: "0.25s",
  },
};
