import axios from 'axios';
import { auth } from '../firebase';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use(async (config) => {
  let token = null;
  if (auth.currentUser) {
    token = await auth.currentUser.getIdToken(true);
    localStorage.setItem('pph_token', token);
  } else {
    token = localStorage.getItem('pph_token');
  }
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
