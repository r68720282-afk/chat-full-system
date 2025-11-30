import React, { useEffect, useState } from "react";
import { getGifts } from "../services/gifts";
import GiftItem from "./GiftItem";

export default function GiftStore({ onSelect }) {
  const [gifts, setGifts] = useState([]);

  useEffect(() => {
    getGifts().then(setGifts);
  }, []);

  return (
    <div
      style={{
        background: "#020b16",
        padding: 12,
        borderRadius: 10,
        width: 260,
        height: 300,
        overflowY: "auto",
        border: "1px solid #133",
        position: "absolute",
        right: 10,
        bottom: 60,
        zIndex: 50,
      }}
    >
      <h4 style={{ marginBottom: 10 }}>🎁 Send Gift</h4>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 10,
        }}
      >
        {gifts.map((g) => (
          <GiftItem key={g._id} gift={g} onClick={() => onSelect(g)} />
        ))}
      </div>
    </div>
  );
}
