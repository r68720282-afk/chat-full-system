// frontend/src/components/DMPopup.jsx
import React, { useEffect, useRef, useState, useContext } from "react";
import { getDMHistory, markSeen } from "../services/dm";
import { SocketContext } from "../context/SocketContext";
import MediaPreview from "./MediaPreview";
import MediaUploader from "./MediaUploader";
import { PresenceContext } from "../context/PresenceContext";
import GiftStore from "./GiftStore";
import { sendGiftDM } from "../services/gifts";
import GiftAnimation from "./GiftAnimation";
import "./dm.css";

export default function DMPopup({ user, onClose, onMinimize }) {
  const { socket } = useContext(SocketContext);
  const { onlineUsers } = useContext(PresenceContext);

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [showGiftStore, setShowGiftStore] = useState(false);
  const [recentGift, setRecentGift] = useState(null);

  const listRef = useRef(null);
  const me = window.__USER_ID__;

  // fetch DM history
  useEffect(() => {
    getDMHistory(user._id).then((msgs) => {
      setMessages(msgs);
      scrollBottom();
      markSeen(user._id).catch(()=>{});
    });

    if (socket) socket.emit("dm_open", { from: me, to: user._id });
    // eslint-disable-next-line
  }, [user]);

  // incoming messages
  useEffect(() => {
    if (!socket) return;
    function handle(msg) {
      if (
        (String(msg.from) === String(user._id) && String(msg.to) === String(me)) ||
        (String(msg.from) === String(me) && String(msg.to) === String(user._id))
      ) {
        setMessages((prev) => [...prev, msg]);
        scrollBottom();
        if (msg.attachments && msg.attachments.find(a=>a.type==='gift')) {
          const g = msg.attachments.find(a=>a.type==='gift');
          setRecentGift({ gift: g, sender: msg.from === me ? 'You' : user.username });
        }
      }
    }

    function onTyping({ from }) {
      if (String(from) === String(user._id)) {
        setTyping(true);
        setTimeout(()=>setTyping(false), 1400);
      }
    }

    socket.on("dm_receive", handle);
    socket.on("dm_typing", onTyping);
    socket.on("dm_seen_ack", ({ from, to }) => {
      // optionally mark messages local as seen
      if (String(from) === String(user._id) && String(to) === String(me)) {
        setMessages(prev => prev.map(m => m.from===from && m.to===to ? { ...m, seen:true } : m));
      }
    });

    // optional gift socket
    socket.on('gift_sent', (payload) => {
      if (!payload) return;
      // payload.message may be dm message too
      const m = payload.message;
      if (m && ((String(m.from) === String(me) && String(m.to) === String(user._id)) || (String(m.from) === String(user._id) && String(m.to) === String(me)))) {
        handle(m);
      }
    });

    return () => {
      socket.off("dm_receive", handle);
      socket.off("dm_typing", onTyping);
      socket.off("dm_seen_ack");
      socket.off('gift_sent');
    };
  }, [socket, user]);

  function scrollBottom() {
    setTimeout(() => {
      if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
    }, 50);
  }

  function send() {
    if (!text.trim()) return;
    socket.emit("dm_send", { from: me, to: user._id, text });
    setText('');
  }

  function sendTyping() {
    socket.emit("dm_typing", { from: me, to: user._id });
  }

  function handleMediaSent(msg) {
    setMessages(prev => [...prev, msg]);
    scrollBottom();
  }

  async function handleSelectGift(gift) {
    try {
      setShowGiftStore(false);
      const res = await sendGiftDM(user._id, gift._id);
      if (res && res.message) {
        setMessages(prev => [...prev, res.message]);
        scrollBottom();
      } else {
        // fallback: emit socket
        socket.emit('dm_send', { from: me, to: user._id, text: '', media: { type: 'gift', filename: gift.image } });
      }
      setRecentGift({ gift: { fileId: null, type: 'gift', filename: gift.image }, sender: 'You' });
    } catch (e) {
      console.error('gift dm err', e);
      alert('Send gift failed');
    }
  }

  return (
    <div className={`dm-popup ${minimized ? 'mini' : ''}`}>
      <div className="dm-header">
        <div className="left">
          <img src={user.avatarUrl || '/public/default-avatar.png'} alt="" className="avatar" />
          <div>
            <div className="username">{user.username}</div>
            <div className="status">{onlineUsers.includes(user._id) ? 'Online' : 'Offline'}</div>
            {typing && <div className="typing">Typing...</div>}
          </div>
        </div>

        <div className="right">
          <button onClick={()=>setShowGiftStore(s=>!s)}>🎁</button>
          <button onClick={()=>setMinimized(!minimized)}>—</button>
          <button onClick={onClose}>✕</button>
        </div>
      </div>

      {!minimized && (
        <>
          <div className="dm-body" ref={listRef}>
            {messages.map((m,i)=>(
              <div key={i} className={`msg ${String(m.from) === String(me) ? 'me' : 'them'}`}>
                {m.text && <div className="bubble">{m.text}</div>}
                {m.attachments && m.attachments.map((a,idx)=>(<MediaPreview key={idx} media={a} />))}
              </div>
            ))}
          </div>

          <div className="dm-media">
            <MediaUploader dmTo={user._id} onSent={handleMediaSent} />
          </div>

          <div className="dm-input">
            <input value={text} onChange={(e)=>{ setText(e.target.value); sendTyping(); }} placeholder="Write a message…" />
            <button onClick={send}>Send</button>
          </div>
        </>
      )}

      {showGiftStore && <GiftStore onSelect={handleSelectGift} />}
      {recentGift && <GiftAnimation gift={recentGift.gift} />}
    </div>
  );
}
