// paste into frontend/src/context/AuthContext.jsx
import React, { createContext, useEffect, useState } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);

  useEffect(() => {
    if (token) {
      // set default header
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // optionally fetch /api/me if exists
      api.get('/api/me').then(res => setUser(res.data.user)).catch(()=>setUser(null));
    } else {
      delete api.defaults.headers.common['Authorization'];
      setUser(null);
    }
  }, [token]);

  function setAuthToken(t){
    if(t){
      localStorage.setItem('token', t);
      setToken(t);
    } else {
      localStorage.removeItem('token');
      setToken(null);
    }
  }

  return (
    <AuthContext.Provider value={{ user, setUser, token, setAuthToken }}>
      {children}
    </AuthContext.Provider>
  );
}
