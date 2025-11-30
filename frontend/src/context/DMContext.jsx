// frontend/src/context/DMContext.jsx
import React, { createContext, useState } from "react";

export const DMContext = createContext();

export function DMProvider({ children }) {
  const [openDMs, setOpenDMs] = useState([]);

  function openDM(user) {
    if (!openDMs.find((d) => d._id === user._id)) {
      setOpenDMs((prev) => [...prev, user]);
    }
  }

  function closeDM(id) {
    setOpenDMs((prev) => prev.filter((u) => u._id !== id));
  }

  return (
    <DMContext.Provider value={{ openDMs, openDM, closeDM }}>
      {children}
    </DMContext.Provider>
  );
}
