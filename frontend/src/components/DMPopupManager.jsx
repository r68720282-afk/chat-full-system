// frontend/src/components/DMPopupManager.jsx
import React, { useState, useContext } from "react";
import DMPopup from "./DMPopup";
import { DMContext } from "../context/DMContext";

export default function DMPopupManager() {
  const { openDMs, closeDM } = useContext(DMContext);

  return (
    <div className="dm-popup-container">
      {openDMs.map((u) => (
        <DMPopup
          key={u._id}
          user={u}
          onClose={() => closeDM(u._id)}
        />
      ))}
    </div>
  );
}

