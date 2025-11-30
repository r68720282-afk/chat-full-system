// frontend/src/services/users.js
import api from './api';

export function fetchUsers() {
  return api.get('/api/users').then(r => r.data);
}

export function getProfile(userId) {
  return api.get(`/api/users/${userId}`).then(r => r.data);
}

export function uploadAvatar(formData) {
  // formData should be FormData with key 'avatar'
  return api.post('/api/users/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then(r => r.data);
}
