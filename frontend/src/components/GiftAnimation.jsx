import React, { useEffect, useState } from "react";

export default function GiftAnimation({ gift }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 3000);
    return () => clearTimeout(t);
  }, []);

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: "20%",
        left: "50%",
        transform: "translateX(-50%)",
        background: "rgba(0,0,0,0.7)",
        padding: 20,
        borderRadius: 12,
        color: "#fff",
        zIndex: 999,
        textAlign: "center",
      }}
    >
      <img
        src={gift.image}
        alt=""
        style={{ width: 120, height: 120, objectFit: "contain" }}
      />
      <div style={{ marginTop: 10 }}>{gift.name}</div>
    </div>
  );
}
