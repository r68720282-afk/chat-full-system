// frontend/src/services/profile.js
import api from './api';

export function fetchMyProfile() {
  return api.get('/api/users/me').then(r => r.data);
}

export function updateMyProfile(data) {
  return api.put('/api/users/me', data).then(r => r.data);
}

export function uploadCover(formData) {
  return api.post('/api/users/cover', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data);
}

export function uploadAvatar(formData) {
  return api.post('/api/users/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data);
}

export function fetchPublicProfile(slug) {
  return api.get(`/api/users/public/${slug}`).then(r => r.data);
}
