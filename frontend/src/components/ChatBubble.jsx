// frontend/src/components/ChatBubble.jsx
import React from 'react';

export default function ChatBubble({ message }) {
  if (message.deleted) {
    return <div style={{fontStyle:'italic',opacity:0.7}}>Message deleted</div>;
  }
  return (
    <div style={{
      marginBottom:8,
      padding:'8px 12px',
      borderRadius:12,
      background:'rgba(255,255,255,0.02)'
    }}>
      <div style={{fontSize:12,opacity:0.85}}><strong>{message.username}</strong> <span style={{fontSize:11, color:'#9aa'}}>• {new Date(message.createdAt).toLocaleTimeString()}</span></div>
      {message.text && <div style={{marginTop:6}}>{message.text}</div>}
    </div>
  );
}
