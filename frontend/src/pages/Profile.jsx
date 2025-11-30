// frontend/src/pages/Profile.jsx
import React, { useEffect, useState } from "react";
import api from "../services/api";
import { getLevelFromXP, getProgressPercent } from "../utils/level";
import LevelBadge from "../components/LevelBadge";
import { likeUser } from "../services/leaderboard";

export default function Profile() {
  const [me, setMe] = useState(null);
  const [liking, setLiking] = useState(false);
  const [likeDone, setLikeDone] = useState(false);

  useEffect(() => {
    api.get("/api/users/me").then((r) => {
      setMe(r.data.user);
    });
  }, []);

  if (!me) return <div className="panel">Loading...</div>;

  const level = getLevelFromXP(me.xp);
  const progress = getProgressPercent(me.xp);

  async function handleLike() {
    try {
      setLiking(true);
      await likeUser(me._id);
      setLikeDone(true);
    } catch (err) {
      alert(err.response?.data?.error || "Already liked or error");
    } finally {
      setLiking(false);
    }
  }

  return (
    <div className="panel" style={{ maxWidth: 680, margin: "auto" }}>
      {/* COVER IMAGE */}
      <div
        style={{
          width: "100%",
          height: 160,
          background: me.coverUrl
            ? `url(${me.coverUrl}) center/cover no-repeat`
            : "#0a0f18",
          borderRadius: 10,
        }}
      ></div>

      {/* AVATAR + INFO */}
      <div style={{ display: "flex", gap: 20, marginTop: -40, padding: 20 }}>
        <img
          src={me.avatarUrl || "/default-avatar.png"}
          style={{
            width: 90,
            height: 90,
            borderRadius: 12,
            objectFit: "cover",
            border: "3px solid #0ea5a0",
          }}
        />

        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <h2 style={{ margin: 0 }}>{me.username}</h2>

            {/* Like Button */}
            {!likeDone ? (
              <button
                className="btn"
                onClick={handleLike}
                disabled={liking}
                style={{ padding: "4px 8px" }}
              >
                ❤️ {liking ? "..." : "Like"}
              </button>
            ) : (
              <span style={{ fontSize: 14, color: "#4cc9f0" }}>
                ❤️ You Liked
              </span>
            )}
          </div>

          {/* XP / LEVEL */}
          <div style={{ marginTop: 8 }}>
            <LevelBadge level={level} />
            <div style={{ fontSize: 12, opacity: 0.75, marginTop: 4 }}>
              {me.xp} XP
            </div>

            <div
              style={{
                height: 10,
                background: "#1a1a1a",
                borderRadius: 4,
                marginTop: 6,
              }}
            >
              <div
                style={{
                  width: `${progress}%`,
                  height: 10,
                  borderRadius: 4,
                  background: "#4cc9f0",
                }}
              ></div>
            </div>
          </div>

          {/* STATS */}
          <div
            style={{
              marginTop: 20,
              display: "flex",
              gap: 20,
              fontSize: 14,
            }}
          >
            <div>❤️ Likes: {me.likes || 0}</div>
            <div>🎁 Gifts: {me.giftsReceived || 0}</div>
            <div>🪙 Coins: {me.coins}</div>
          </div>

          {/* BASIC INFO */}
          <div style={{ marginTop: 20, fontSize: 14, opacity: 0.8 }}>
            Gender: {me.gender || "Not set"} <br />
            Age: {me.age || "Not set"} <br />
            Email: {me.email}
          </div>
        </div>
      </div>
    </div>
  );
}
