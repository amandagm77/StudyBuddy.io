import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true, // REQUIRED: lets the browser send the httpOnly cookie automatically
});

export default api;