import axios from 'axios';

// Backend URL'ini buraya yazıyoruz
const API_URL = 'http://127.0.0.1:8000'; // Kendi portuna göre düzenle

const api = axios.create({
  baseURL: API_URL,
});

// Her istekten önce çalışıp araya girer ve Token'ı ekler
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;