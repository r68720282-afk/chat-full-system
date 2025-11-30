// frontend/src/pages/Leaderboard.jsx
import React, { useEffect, useState } from "react";
import { getTopXP, getTopLikes, getTopGifts } from "../services/leaderboard";
import TopCard from "../components/TopCard";

export default function Leaderboard() {
  const [tab, setTab] = useState("xp");
  const [list, setList] = useState([]);

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, [tab]);

  function load() {
    if (tab === "xp") getTopXP().then(setList);
    if (tab === "likes") getTopLikes().then(setList);
    if (tab === "gifts") getTopGifts().then(setList);
  }

  return (
    <div className="panel" style={{ padding: 20 }}>
      <h2>Leaderboard</h2>

      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <button
          className="btn"
          onClick={() => setTab("xp")}
          style={{ background: tab === "xp" ? "#0ea5a0" : "#123" }}
        >
          ⭐ Top XP
        </button>
        <button
          className="btn"
          onClick={() => setTab("likes")}
          style={{ background: tab === "likes" ? "#0ea5a0" : "#123" }}
        >
          ❤️ Top Likes
        </button>
        <button
          className="btn"
          onClick={() => setTab("gifts")}
          style={{ background: tab === "gifts" ? "#0ea5a0" : "#123" }}
        >
          🎁 Top Gifts
        </button>
      </div>

      <div style={{ display: "grid", gap: 12 }}>
        {list.map((u, i) => (
          <TopCard user={u} key={i} />
        ))}
      </div>
    </div>
  );
}
