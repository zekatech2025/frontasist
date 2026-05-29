import axios from 'axios';
import Cookies from 'js-cookie';

const api = axios.create({ baseURL: '/api', timeout: 60000 });

api.interceptors.request.use(config => {
  const token = Cookies.get('rag_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      Cookies.remove('rag_token');
      Cookies.remove('rag_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  login:    data => api.post('/auth/login', data),
  register: data => api.post('/auth/register', data),
  me:       ()   => api.get('/auth/me'),
};

export const documentsAPI = {
  list:      ()             => api.get('/documents'),
  upload:    (fd, onProg)   => api.post('/documents/upload', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: e => onProg?.(Math.round(e.loaded * 100 / e.total)),
    timeout: 120000,
  }),
  getStatus: id => api.get(`/documents/${id}/status`),
  delete:    id => api.delete(`/documents/${id}`),
  stats:     ()  => api.get('/documents/stats/overview'),
};

export const chatAPI = {
  send:               data => api.post('/chat', data),
  availableDocuments: ()   => api.get('/chat/available-documents'),
};
