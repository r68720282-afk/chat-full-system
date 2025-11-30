// frontend/src/components/DMUserItem.jsx
import React, { useContext } from "react";
import { DMContext } from "../context/DMContext";
import { PresenceContext } from "../context/PresenceContext";

export default function DMUserItem({ user }) {
  const { openDM } = useContext(DMContext);
  const { onlineUsers } = useContext(PresenceContext);

  return (
    <div className="dm-user-item" onClick={() => openDM(user)}>
      <img
        src={user.avatarUrl || "/public/default-avatar.png"}
        className="avatar"
        alt=""
      />
      <div className="info">
        <div className="username">{user.username}</div>
        <div className="status">
          {onlineUsers.includes(user._id) ? "Online" : "Offline"}
        </div>
      </div>
    </div>
  );
}
