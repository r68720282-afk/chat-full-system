// frontend/src/pages/Rooms.jsx
import React, { useEffect, useState, useContext } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function Rooms(){
  const [rooms, setRooms] = useState([]);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const { user } = useContext(AuthContext);
  const nav = useNavigate();

  useEffect(() => {
    api.get('/api/rooms').then(r => setRooms(r.data.rooms)).catch(()=>setRooms([]));
  }, []);

  function openRoom(slug){
    nav(`/chat/${slug}`);
  }

  async function createRoom() {
    try {
      await api.post('/api/rooms', { name, slug });
      const res = await api.get('/api/rooms');
      setRooms(res.data.rooms);
      setName(''); setSlug('');
    } catch (err) {
      alert('Create failed: ' + (err.response?.data?.error || 'error'));
    }
  }

  async function seed() {
    try {
      await api.post('/api/rooms/seed');
      const res = await api.get('/api/rooms');
      setRooms(res.data.rooms);
    } catch (e) { console.error(e); }
  }

  return (
    <div className="panel" style={{ display:'flex', gap:20 }}>
      <div style={{ flex:1 }}>
        <h3>Rooms</h3>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
          {rooms.map(r=>(
            <div key={r.slug} className="room-card" style={{ padding:12, borderRadius:8, background:'#071021' }}>
              <div style={{ fontWeight:700 }}>{r.name}</div>
              <div style={{ fontSize:12, opacity:0.8 }}>{r.slug}</div>
              <div style={{ marginTop:8, display:'flex', gap:8 }}>
                <button className="btn" onClick={()=>openRoom(r.slug)}>Join</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ width:320 }}>
        <h4>Create room (owner/admin only)</h4>
        <input placeholder="Room name" value={name} onChange={e=>setName(e.target.value)} />
        <input placeholder="slug (eg: myroom)" value={slug} onChange={e=>setSlug(e.target.value)} />
        <button className="btn" onClick={createRoom}>Create</button>

        <div style={{ marginTop:16 }}>
          <button className="btn" onClick={seed}>Seed Default Rooms</button>
        </div>
      </div>
    </div>
  );
}
