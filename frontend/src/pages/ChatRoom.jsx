// frontend/src/pages/ChatRoom.jsx
import React, { useEffect, useState, useContext, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import ChatBubble from '../components/ChatBubble';
import MediaUploader from '../components/MediaUploader';
import MediaPreview from '../components/MediaPreview';
import GiftStore from '../components/GiftStore';
import GiftAnimation from '../components/GiftAnimation';
import { sendGiftRoom } from '../services/gifts';
import { SocketContext } from '../context/SocketContext';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || '/';

export default function ChatRoom(){
  const { room } = useParams();
  const { user } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [typingUsers, setTypingUsers] = useState([]);
  const [userCount, setUserCount] = useState(0);
  const [showGiftStore, setShowGiftStore] = useState(false);
  const [recentGift, setRecentGift] = useState(null);
  const socketRef = useRef(null);
  const listRef = useRef(null);
  const pageRef = useRef(0);
  const loadingMore = useRef(false);

  useEffect(() => {
    // load messages
    pageRef.current = 0;
    api.get(`/api/messages/${room}?page=0&per=40`).then(r => setMessages(r.data.messages)).catch(()=>{});

    // connect socket (use central SocketContext socket if available, else create local)
    let s = socket;
    if (!s) {
      s = io(SOCKET_URL, { transports: ['websocket','polling'], query: { token: localStorage.getItem('token') } });
    }
    socketRef.current = s;
    s.emit('join_room', room);

    // handlers
    const onMessage = (m) => {
      setMessages(prev => [...prev, m]);
      scrollBottom();
      // check gift attachment for animation
      if ((m.attachments && m.attachments.some(a=>a.type === 'gift')) || (m.media && m.media.type === 'gift')) {
        const gift = (m.attachments && m.attachments.find(a=>a.type==='gift')) || m.media;
        setRecentGift({ gift, sender: m.username });
      }
    };

    const onChatMessage = (m) => onMessage(m);

    const onTyping = ({ username, isTyping }) => {
      setTypingUsers(prev => {
        const next = prev.filter(u => u !== username);
        if (isTyping) next.push(username);
        return next;
      });
    };

    const onUserCount = ({ count }) => setUserCount(count);

    s.on('message', onMessage);
    s.on('chat_message', onChatMessage);
    s.on('typing', onTyping);
    s.on('room_user_count', onUserCount);

    // optional gift broadcast socket (if backend emits)
    s.on('gift_sent', (payload) => {
      // payload: { room, message }
      if (payload && payload.room === room && payload.message) onMessage(payload.message);
    });

    return () => {
      s.emit('leave_room', room);
      if (!socket) s.disconnect();
      s.off('message', onMessage);
      s.off('chat_message', onChatMessage);
      s.off('typing', onTyping);
      s.off('room_user_count', onUserCount);
      s.off('gift_sent');
    };
    // eslint-disable-next-line
  }, [room]);

  function scrollBottom(){
    setTimeout(()=> {
      if(listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
    }, 50);
  }

  function sendTyping(e){
    if (!socketRef.current) return;
    socketRef.current.emit('typing', { room, username: user?.username || 'Guest', isTyping: e.target.value.length > 0 });
  }

  function send(){
    if(!text) return;
    const payload = {
      room,
      userId: user?.id || null,
      username: user?.username || 'Guest',
      text,
      xp: 2
    };
    socketRef.current.emit('chat_message', payload);
    setText('');
  }

  // infinite scroll: load older messages when top reached
  async function onScroll(e){
    const el = e.target;
    if (el.scrollTop < 50 && !loadingMore.current) {
      loadingMore.current = true;
      pageRef.current += 1;
      try {
        const r = await api.get(`/api/messages/${room}?page=${pageRef.current}&per=40`);
        const older = r.data.messages || [];
        if (older.length) setMessages(prev => [...older, ...prev]);
      } catch (err) { console.error(err); }
      loadingMore.current = false;
    }
  }

  // called by MediaUploader when backend returns saved message
  function onMediaSent(msg) {
    if (msg) setMessages(prev => [...prev, msg]);
    scrollBottom();
    if ((msg.attachments && msg.attachments.find(a=>a.type==='gift')) || (msg.media && msg.media.type==='gift')) {
      const gift = (msg.attachments && msg.attachments.find(a=>a.type==='gift')) || msg.media;
      setRecentGift({ gift, sender: msg.username });
    }
  }

  // gift selection handler from GiftStore
  async function handleSelectGift(gift) {
    try {
      setShowGiftStore(false);
      // call backend to create message and deduct coins
      const res = await sendGiftRoom(room, gift._id);
      if (res && res.message) {
        setMessages(prev => [...prev, res.message]);
        scrollBottom();
      } else {
        // fallback: optimistic socket emit (if backend returns fileId)
        if (res && res.fileId && socketRef.current) {
          socketRef.current.emit('chat_message', {
            room,
            userId: user?.id,
            username: user?.username,
            text: '',
            media: { fileId: res.fileId, type: 'gift', filename: gift.image }
          });
        }
      }
      // show animation locally
      setRecentGift({ gift: { fileId: null, type: 'gift', filename: gift.image }, sender: user?.username });
    } catch (e) {
      console.error('send gift error', e);
      alert((e.response && e.response.data && e.response.data.error) || 'Gift send failed');
    }
  }

  return (
    <div className="chat panel" style={{display:'flex',flexDirection:'column',height:'75vh'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <h3>Room: {room}</h3>
        <div style={{display:'flex',gap:12,alignItems:'center'}}>
          <div style={{fontSize:13,opacity:0.8}}>Users: {userCount}</div>
          <button className="btn" onClick={()=>setShowGiftStore(s=>!s)}>🎁 Gifts</button>
        </div>
      </div>

      <div className="messages" ref={listRef} onScroll={onScroll} style={{flex:1,overflow:'auto',padding:8}}>
        {messages.map((m,i)=>(<div key={m._id||i}>
          <ChatBubble message={m} />
          {m.media && <MediaPreview media={m.media} />}
          {m.attachments && m.attachments.map((a, idx)=>(<MediaPreview key={idx} media={a} />))}
        </div>))}
      </div>

      <div style={{padding:8}}>
        {typingUsers.length > 0 && <div style={{fontSize:12,opacity:0.8}}>{typingUsers.join(', ')} typing...</div>}
        <MediaUploader room={room} onSent={onMediaSent} />
        <div style={{display:'flex',gap:8,marginTop:8}}>
          <input value={text} onChange={(e)=>{ setText(e.target.value); sendTyping(e); }} placeholder="Message..." />
          <button className="btn" onClick={send}>Send</button>
        </div>
      </div>

      {showGiftStore && <GiftStore onSelect={handleSelectGift} />}

      {recentGift && <GiftAnimation gift={recentGift.gift} />}
    </div>
  );
}
