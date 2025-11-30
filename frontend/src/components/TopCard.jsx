// frontend/src/components/TopCard.jsx
import React from "react";

export default function TopCard({ user }) {
  return (
    <div
      style={{
        background: "#07101c",
        padding: 14,
        borderRadius: 10,
        border: "1px solid #122",
        display: "flex",
        gap: 12,
        alignItems: "center",
      }}
    >
      <img
        src={user.avatarUrl || "/default-avatar.png"}
        style={{
          width: 48,
          height: 48,
          borderRadius: "50%",
          objectFit: "cover",
        }}
      />

      <div>
        <div style={{ fontWeight: 700 }}>{user.username}</div>
        <div style={{ fontSize: 12, opacity: 0.8 }}>
          ⭐ Level {user.level} — {user.xp} XP
        </div>
        <div style={{ fontSize: 11, opacity: 0.6, marginTop: 4 }}>
          ❤️ Likes: {user.likes} • 🎁 Gifts: {user.giftsReceived}
        </div>
      </div>
    </div>
  );
}
