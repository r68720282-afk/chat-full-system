
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/', // if frontend served from same origin use '/'
  withCredentials: true,
});

export default api;
