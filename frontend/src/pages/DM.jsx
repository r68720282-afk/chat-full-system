// frontend/src/pages/DMPage.jsx
import React, { useEffect, useState } from "react";
import api from "../services/api";
import DMUserItem from "../components/DMUserItem";

export default function DMPage() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    api.get("/api/users").then((r) => setUsers(r.data.users));
  }, []);

  return (
    <div className="panel" style={{ maxWidth: 600, margin: "20px auto" }}>
      <h3>Direct Messages</h3>

      {users.map((u) => (
        <DMUserItem key={u._id} user={u} />
      ))}
    </div>
  );
}
