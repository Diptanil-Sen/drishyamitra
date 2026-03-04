import axios from 'axios';

const API = axios.create({
baseURL: 'https://drishyamitra.onrender.com/api',});

// Automatically attach token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const signup = (data) => API.post('/auth/signup', data);
export const login = (data) => API.post('/auth/login', data);

// Photos
export const uploadPhoto = (formData) => API.post('/photos/upload', formData);
export const getAllPhotos = () => API.get('/photos/all');
export const getPhotosByPerson = (personId) => API.get(`/photos/by-person/${personId}`);
export const deletePhoto = (photoId) => API.delete(`/photos/delete/${photoId}`);

// Faces & People
export const getPeople = () => API.get('/faces/people');
export const addPerson = (data) => API.post('/faces/people/add', data);
export const detectFaces = (photoId) => API.post(`/faces/detect/${photoId}`);
export const labelFace = (data) => API.post('/faces/label', data);
export const getFacesInPhoto = (photoId) => API.get(`/faces/in-photo/${photoId}`);

// Chatbot
export const sendMessage = (data) => API.post('/chatbot/chat', data);
export const sendEmail = (data) => API.post('/chatbot/send-email', data);
export const sendWhatsApp = (data) => API.post('/chatbot/send-whatsapp', data);
export const getHistory = () => API.get('/chatbot/history');

export const getUnlabeledFaces = () => API.get('/faces/unlabeled');

export const searchPhotos = (q, date) => API.get(`/photos/search?q=${encodeURIComponent(q)}&date=${date}`);