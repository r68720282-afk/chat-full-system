// frontend/src/pages/Home.jsx
import React, { useEffect, useState } from "react";
import api from "../services/api";
import { Link } from "react-router-dom";

export default function Home() {
  const [online, setOnline] = useState(0);
  const [rooms, setRooms] = useState([]);
  const [top, setTop] = useState([]);

  useEffect(() => {
    loadOnline();
    loadRooms();
    loadTopUsers();
  }, []);

  async function loadOnline() {
    try {
      const r = await api.get("/api/presence/online");
      setOnline(r.data.users?.length || 0);
    } catch {}
  }

  async function loadRooms() {
    try {
      const r = await api.get("/api/rooms");
      setRooms(r.data.rooms || []);
    } catch {}
  }

  async function loadTopUsers() {
    try {
      const r = await api.get("/api/leaderboard/xp");
      setTop(r.slice(0, 3) || []);
    } catch {}
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg,#050811,#08121d)",
        padding: "20px 0",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div style={{ width: "95%", maxWidth: 1150 }}>
        {/* MAIN BANNER */}
        <div
          style={{
            background:
              "linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))",
            borderRadius: 16,
            padding: "40px 32px",
            boxShadow: "0 8px 40px rgba(0,0,0,0.45)",
            border: "1px solid rgba(255,255,255,0.05)",
            textAlign: "center",
            marginBottom: 40,
          }}
        >
          <h1 style={{ margin: 0, fontSize: 36, color: "#f0f7ff" }}>
            Welcome to ChatSite
          </h1>
          <p
            style={{
              marginTop: 10,
              fontSize: 16,
              color: "rgba(255,255,255,0.75)",
            }}
          >
            India’s clean & fast chat platform — join rooms, DM users, level up,
            earn XP and send gifts.
          </p>

          <div style={{ marginTop: 22 }}>
            <Link to="/rooms">
              <button
                className="btn"
                style={{
                  padding: "12px 28px",
                  fontSize: 16,
                  borderRadius: 10,
                }}
              >
                Enter Chat Rooms
              </button>
            </Link>
          </div>

          <div
            style={{
              marginTop: 22,
              fontSize: 14,
              color: "#9ab4cc",
            }}
          >
            🔵 Online Now: {online}
          </div>
        </div>

        {/* ROOMS SECTION */}
        <h2 style={{ color: "#e9f3ff", marginBottom: 14 }}>Popular Rooms</h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))",
            gap: 20,
            marginBottom: 50,
          }}
        >
          {rooms.map((room) => (
            <Link
              key={room._id}
              to={`/chat/${room.slug}`}
              style={{ textDecoration: "none" }}
            >
              <div
                style={{
                  background:
                    "linear-gradient(180deg,#07131f,#05111a,#07111c)",
                  padding: 18,
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.04)",
                  boxShadow: "0 4px 25px rgba(0,0,0,0.4)",
                  transition: "transform .15s",
                }}
              >
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    marginBottom: 6,
                  }}
                >
                  {room.name}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    opacity: 0.7,
                    marginBottom: 10,
                  }}
                >
                  {room.isLocked ? "🔒 Locked Room" : "🔓 Open Room"}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: "#a5e0ff",
                  }}
                >
                  {room.online || 0} online
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* TOP USERS */}
        <h2 style={{ color: "#e9f3ff", marginBottom: 14 }}>Top Users</h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
            gap: 20,
          }}
        >
          {top.map((u, i) => (
            <div
              key={i}
              style={{
                background:
                  "linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))",
                padding: 18,
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.04)",
                boxShadow: "0 4px 25px rgba(0,0,0,0.4)",
                textAlign: "center",
              }}
            >
              <img
                src={u.avatarUrl || "/default-avatar.png"}
                style={{
                  width: 70,
                  height: 70,
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "2px solid rgba(255,255,255,0.1)",
                  marginBottom: 10,
                }}
              />

              <div style={{ fontSize: 16, fontWeight: 700 }}>{u.username}</div>
              <div style={{ fontSize: 13, opacity: 0.75, marginTop: 4 }}>
                ⭐ Level {u.level}
              </div>
              <div style={{ fontSize: 12, opacity: 0.6, marginTop: 2 }}>
                {u.xp} XP
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            textAlign: "center",
            marginTop: 40,
            fontSize: 13,
            opacity: 0.5,
          }}
        >
          © {new Date().getFullYear()} ChatSite — All rights reserved.
        </div>
      </div>
    </div>
  );
}
