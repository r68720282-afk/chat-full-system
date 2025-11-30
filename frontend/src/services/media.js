// frontend/src/services/media.js
import api from './api';

export async function uploadRawFile(formData, onProgress) {
  // /api/media/upload -> stores in GridFS and returns file metadata (id, filename, contentType)
  const res = await api.post('/api/media/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (ev) => {
      if (onProgress) onProgress(Math.round((ev.loaded * 100) / ev.total));
    }
  });
  return res.data;
}

export async function attachToRoom(formData) {
  // convenience if backend expects /api/media/room with formData { file, room }
  const res = await api.post('/api/media/room', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
}

export async function attachToDM(formData) {
  const res = await api.post('/api/media/dm', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
}

export function getMediaUrl(fileId) {
  if (!fileId) return null;
  // assumes backend route /api/media/:id streams file
  const base = process.env.REACT_APP_API_URL || '';
  return `${base}/api/media/${fileId}`;
}
