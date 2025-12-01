import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </BrowserRouter>
  );
}

// Your landing page component
function HomePage() {
  return (
    <div style={styles.page}>
      <div style={styles.heroWrapper}>
        <h1 style={styles.title}>
          Welcome to <span style={styles.brand}>ChatSite</span>
        </h1>

        <p style={styles.subtitle}>
          Connect with people instantly. Rooms, DMs, Levels, XP — All in one platform.
        </p>

        <div style={styles.buttons}>
          <Link
            to="/login"
            style={{ ...styles.buttonPrimary, ...styles.hoverBase }}
            onMouseEnter={(e) => applyHover(e, "primary")}
            onMouseLeave={(e) => removeHover(e, "primary")}
          >
            Login
          </Link>

          <Link
            to="/signup"
            style={{ ...styles.buttonSecondary, ...styles.hoverBase }}
            onMouseEnter={(e) => applyHover(e, "secondary")}
            onMouseLeave={(e) => removeHover(e, "secondary")}
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ----------- Hover Animation -------------- */

function applyHover(e, type) {
  if (type === "primary") {
    e.target.style.transform = "scale(1.08)";
    e.target.style.background = "#00f2ff";
    e.target.style.boxShadow = "0 0 15px #00e1ff";
  } else {
    e.target.style.transform = "scale(1.08)";
    e.target.style.background = "rgba(0, 225, 255, 0.1)";
    e.target.style.boxShadow = "0 0 15px #00e1ff";
  }
}

function removeHover(e, type) {
  if (type === "primary") {
    e.target.style.transform = "scale(1)";
    e.target.style.background = "#00e1ff";
    e.target.style.boxShadow = "none";
  } else {
    e.target.style.transform = "scale(1)";
    e.target.style.background = "transparent";
    e.target.style.boxShadow = "none";
  }
}

/* ----------- CSS Styles Object -------------- */

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(180deg,#03050b,#08121d)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  heroWrapper: {
    textAlign: "center",
    maxWidth: 600,
    padding: 30,
    background: "rgba(255,255,255,0.04)",
    borderRadius: 20,
    boxShadow: "0 0 40px rgba(0,0,0,0.5)",
    border: "1px solid rgba(255,255,255,0.08)",
  },
  title: {
    fontSize: 36,
    fontWeight: 700,
    color: "#fff",
  },
  brand: {
    color: "#00e1ff",
  },
  subtitle: {
    marginTop: 10,
    color: "#cce7ff",
    fontSize: 16,
  },
  buttons: {
    marginTop: 25,
    display: "flex",
    justifyContent: "center",
    gap: 20,
  },
  buttonPrimary: {
    padding: "12px 28px",
    background: "#00e1ff",
    color: "#000",
    fontWeight: 700,
    textDecoration: "none",
    borderRadius: 10,
    transition: "0.2s",
  },
  buttonSecondary: {
    padding: "12px 28px",
    border: "2px solid #00e1ff",
    color: "#00e1ff",
    fontWeight: 700,
    textDecoration: "none",
    borderRadius: 10,
    transition: "0.2s",
  },
  hoverBase: {
    cursor: "pointer",
  },
};
