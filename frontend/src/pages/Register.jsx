// paste into frontend/src/pages/Register.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../services/auth';

export default function Register(){
  const [username, setU] = useState('');
  const [email, setE] = useState('');
  const [password, setP] = useState('');
  const [age, setAge] = useState(18);
  const [gender, setG] = useState('Male');
  const nav = useNavigate();

  async function onSubmit(e){
    e.preventDefault();
    try {
      await register({ username, email, password, age, gender });
      alert('Registered. Please login.');
      nav('/login');
    } catch(err){
      alert('Registration failed');
      console.error(err);
    }
  }

  return (
    <div className='panel'>
      <h3>Register</h3>
      <form onSubmit={onSubmit}>
        <input placeholder='Username' value={username} onChange={e=>setU(e.target.value)} />
        <input placeholder='Email' value={email} onChange={e=>setE(e.target.value)} />
        <input placeholder='Password' type='password' value={password} onChange={e=>setP(e.target.value)} />
        <input placeholder='Age' type='number' value={age} onChange={e=>setAge(e.target.value)} min={18} max={99} />
        <select value={gender} onChange={e=>setG(e.target.value)}><option>Male</option><option>Female</option><option>Other</option></select>
        <button className='btn' type='submit'>Register</button>
      </form>
    </div>
  );
}
