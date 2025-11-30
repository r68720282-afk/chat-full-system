// frontend/src/context/SocketContext.jsx
import React, { createContext, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

export const SocketContext = createContext();

export function SocketProvider({ children }) {
  const socketRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    // socket connects with token in query for presence auth
    const socket = io(process.env.REACT_APP_SOCKET_URL || '/', {
      transports: ['websocket','polling'],
      query: { token }
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('socket connected', socket.id);
      // optional heartbeat
      setInterval(()=> socket.emit('presence_heartbeat', {}), 30*1000);
    });

    socket.on('disconnect', ()=> console.log('socket disconnected'));

    // global presence events
    socket.on('presence_update', (d)=> { /* you can dispatch to PresenceContext */ console.log('presence_update', d); });
    socket.on('user_idle_update', (d)=> console.log('user idle', d));

    return () => { socket.disconnect(); };
  }, []);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current }}>
      {children}
    </SocketContext.Provider>
  );
}
