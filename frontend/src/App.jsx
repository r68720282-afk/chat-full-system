import React from "react";
import { Link } from "react-router-dom";

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

/* ----------------------------------------
   INLINE HOVER ANIMATION HANDLERS
---------------------------------------- */

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

/* ----------------------------------------
   ALL STYLES IN SAME FILE
---------------------------------------- */

const styles = {
  page:
