// frontend/src/context/PresenceContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { SocketContext } from './SocketContext';

export const PresenceContext = createContext();

export function PresenceProvider({ children }) {
  const { socket } = useContext(SocketContext);
  const [onlineMap, setOnlineMap] = useState({}); // userId -> { online, lastSeen, isIdle }

  useEffect(() => {
    if (!socket) return;
    function onPresence(d) {
      setOnlineMap(prev => ({ ...prev, [d.userId]: { online: d.online, lastSeen: d.lastSeen || null } }));
    }
    function onIdle(d) {
      setOnlineMap(prev => ({ ...prev, [d.userId]: { ...(prev[d.userId]||{}), isIdle: d.isIdle } }));
    }
    socket.on('presence_update', onPresence);
    socket.on('user_idle_update', onIdle);

    return () => {
      socket.off('presence_update', onPresence);
      socket.off('user_idle_update', onIdle);
    };
  }, [socket]);

  return <PresenceContext.Provider value={{ onlineMap, setOnlineMap }}>{children}</PresenceContext.Provider>;
}
