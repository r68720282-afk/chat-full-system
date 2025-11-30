// paste into frontend/src/services/auth.js
import api from './api';

export async function register(data){
  return api.post('/api/auth/register', data).then(r => r.data);
}

export async function login(data){
  return api.post('/api/auth/login', data).then(r => r.data);
}

export async function guest(data){
  return api.post('/api/auth/guest', data).then(r => r.data);
}
