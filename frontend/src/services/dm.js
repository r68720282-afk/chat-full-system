// frontend/src/services/dm.js
import api from './api';

export async function getDMHistory(id) {
  const res = await api.get(`/api/dm/${id}`);
  return res.data.messages;
}

export async function markSeen(id) {
  return api.post(`/api/dm/seen/${id}`);
}
