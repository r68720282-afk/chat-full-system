// paste into frontend/src/pages/Login.jsx
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/auth';
import { AuthContext } from '../context/AuthContext';

export default function Login(){
  const [emailOrUsername, setEU] = useState('');
  const [password, setP] = useState('');
  const { setAuthToken } = useContext(AuthContext);
  const nav = useNavigate();

  async function onSubmit(e){
    e.preventDefault();
    try {
      const res = await login({ emailOrUsername, password });
      if(res.accessToken){
        setAuthToken(res.accessToken);
        nav('/rooms');
      }
    } catch (err){
      alert('Login failed');
      console.error(err);
    }
  }

  return (
    <div className='panel'>
      <h3>Login</h3>
      <form onSubmit={onSubmit}>
        <input placeholder='Email or Username' value={emailOrUsername} onChange={e=>setEU(e.target.value)} />
        <input placeholder='Password' type='password' value={password} onChange={e=>setP(e.target.value)} />
        <button className='btn' type='submit'>Login</button>
      </form>
    </div>
  );
}
