// frontend/src/components/OnlineBadge.jsx
import React, { useContext } from 'react';
import { PresenceContext } from '../context/PresenceContext';

export default function OnlineBadge({ userId }) {
  const { onlineMap } = useContext(PresenceContext);
  const info = onlineMap[userId] || {};
  if (info.online) {
    if (info.isIdle) {
      return <span style={{color:'#f59e0b'}}>Idle</span>;
    }
    return <span style={{color:'#22c55e'}}>Online</span>;
  } else {
    if (info.lastSeen) {
      const diff = Math.floor((Date.now() - new Date(info.lastSeen)) / 1000);
      if (diff < 60) return <span style={{color:'#94a3b8'}}>Last seen just now</span>;
      if (diff < 3600) return <span style={{color:'#94a3b8'}}>Last seen {Math.floor(diff/60)}m ago</span>;
      return <span style={{color:'#94a3b8'}}>Last seen {Math.floor(diff/3600)}h ago</span>;
    }
    return <span style={{color:'#94a3b8'}}>Offline</span>;
  }
}
