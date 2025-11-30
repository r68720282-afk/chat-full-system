// frontend/src/components/MediaUploader.jsx
import React, { useRef, useState, useContext } from 'react';
import { uploadRawFile, attachToRoom, attachToDM } from '../services/media';
import { SocketContext } from '../context/SocketContext';
import MediaPreview from './MediaPreview';

/**
 * Props:
 * - room (string) OR dmTo (userId) — one must be provided
 * - onSent(optional) => called with message object returned from backend/socket
 */
export default function MediaUploader({ room, dmTo, onSent }) {
  const fileRef = useRef(null);
  const { socket } = useContext(SocketContext);
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);

  function onChoose() {
    fileRef.current.click();
  }

  function onFile(e) {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setProgress(0);
  }

  async function onSend() {
    if (!file) return;
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);

      // If attaching directly to room/dm via route:
      if (room) fd.append('room', room);
      if (dmTo) fd.append('to', dmTo);

      // Upload the file (GridFS) and attach message via backend route
      // Prefer using /api/media/room or /api/media/dm so backend creates message and broadcasts
      let result;
      if (room) {
        result = await attachToRoom(fd); // returns { ok:true, message }
        // Optional fallback: emit socket with media if backend just returns fileId
        if (result && result.message) {
          if (onSent) onSent(result.message);
        } else if (result && result.fileId && socket) {
          socket.emit('chat_message', {
            room,
            userId: window.__USER_ID__ || null,
            text: '',
            media: { fileId: result.fileId, type: file.type }
          });
        }
      } else if (dmTo) {
        result = await attachToDM(fd);
        if (result && result.message) {
          if (onSent) onSent(result.message);
        } else if (result && result.fileId && socket) {
          socket.emit('dm_send', {
            from: window.__USER_ID__ || null,
            to: dmTo,
            text: '',
            media: { fileId: result.fileId, type: file.type }
          });
        }
      }
      setFile(null);
      setProgress(0);
    } catch (err) {
      console.error('upload error', err);
      alert('Upload failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <input ref={fileRef} type="file" accept="image/*,video/*,audio/*,application/pdf" style={{ display: 'none' }} onChange={onFile} />
      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn" onClick={onChoose} disabled={loading}>Choose file</button>
        <button className="btn" onClick={onSend} disabled={!file || loading}>{loading ? 'Sending...' : 'Send'}</button>
      </div>

      {file && (
        <div style={{ display:'flex', gap:12, alignItems:'center' }}>
          <div style={{ width: 120 }}>
            <MediaPreview media={{ fileId: null, type: file.type, filename: file.name }} />
            {/* preview uses local file via object URL */}
            <div style={{ fontSize:12, opacity:0.8 }}>{file.name}</div>
          </div>
          <div style={{ flex:1 }}>
            <div style={{ height:8, width:'100%', background:'#0b1220', borderRadius:6 }}>
              <div style={{ width:`${progress}%`, height:8, background:'#6ee7b7', borderRadius:6 }} />
            </div>
            <div style={{ fontSize:12, marginTop:6 }}>{progress}%</div>
          </div>
        </div>
      )}
    </div>
  );
}
