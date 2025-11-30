// frontend/src/components/UserSidebar.jsx
import React, { useEffect, useState, useContext } from 'react';
import { fetchUsers } from '../services/users';
import { AuthContext } from '../context/AuthContext';
import DMPopup from './DMPopup';

export default function UserSidebar() {
  const [users, setUsers] = useState([]);
  const [dmUser, setDmUser] = useState(null);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchUsers().then(r => setUsers(r.users || []))
      .catch(err => { console.error('users fetch', err); setUsers([]); });
  }, []);

  return (
    <div style={{ width: 260, padding: 12, background: 'rgba(255,255,255,0.02)', borderRadius: 8 }}>
      <h4>Users</h4>
      <div style={{ maxHeight: '60vh', overflow: 'auto' }}>
        {users.filter(u => u._id !== (user && user.id)).map(u => (
          <div key={u._id} style={{ display:'flex', alignItems:'center', gap:8, padding:8, borderBottom:'1px solid rgba(255,255,255,0.02)' }}>
            <img src={u.avatarUrl || '/public/default-avatar.png'} alt='' style={{width:36,height:36,borderRadius:18,objectFit:'cover'}}/>
            <div style={{flex:1}}>
              <div style={{fontSize:14}}>{u.username}</div>
              <div style={{fontSize:12,opacity:0.7}}>XP: {u.xp||0}</div>
            </div>
            <div>
              <button className='btn' onClick={() => setDmUser(u)}>DM</button>
            </div>
          </div>
        ))}
      </div>

      {dmUser && <DMPopup user={dmUser} close={() => setDmUser(null)} />}
    </div>
  );
}
