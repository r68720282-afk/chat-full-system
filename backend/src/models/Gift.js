import React, { useEffect, useState } from "react";
import api from "../services/api";
import { getLevelFromXP, getProgressPercent } from "../utils/level";
import LevelBadge from "../components/LevelBadge";

export default function Profile() {
  const [me, setMe] = useState(null);

  useEffect(() => {
    api.get("/api/users/me").then((r) => setMe(r.data.user));
  }, []);

  if (!me) return <div>Loading...</div>;

  const level = getLevelFromXP(me.xp);
  const progress = getProgressPercent(me.xp);

  return (
    <div className="panel" style={{ maxWidth: 600, margin: "auto" }}>
      <h2>{me.username}</h2>

      <LevelBadge level={level} />

      <div style={{ marginTop: 20 }}>
        <div style={{ fontSize: 12, opacity: 0.7 }}>XP: {me.xp}</div>

        <div
          style={{
            height: 10,
            background: "#1a1a1a",
            borderRadius: 4,
            marginTop: 8,
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: "10px",
              borderRadius: 4,
              background: "#4cc9f0",
            }}
          ></div>
        </div>
      </div>
    </div>
  );
}
