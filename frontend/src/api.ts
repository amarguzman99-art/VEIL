import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE = process.env.EXPO_PUBLIC_BACKEND_URL;
const TOKEN_KEY = 'veil_token';
const USER_KEY = 'veil_user';

export const api = axios.create({
  baseURL: `${BASE}/api`,
  timeout: 15000,
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const saveAuth = async (token: string, user: any) => {
  await AsyncStorage.setItem(TOKEN_KEY, token);
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const clearAuth = async () => {
  await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
};

export const getStoredUser = async () => {
  const raw = await AsyncStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
};

export const getToken = async () => AsyncStorage.getItem(TOKEN_KEY);

// Auth
export const register = (data: any) => api.post('/auth/register', data).then(r => r.data);
export const login = (data: any) => api.post('/auth/login', data).then(r => r.data);
export const me = () => api.get('/auth/me').then(r => r.data);
export const deleteAccount = () => api.delete('/auth/account').then(r => r.data);

// Profile
export const updateProfile = (data: any) => api.put('/profile', data).then(r => r.data);

// Users
export const getNearby = () => api.get('/users/nearby').then(r => r.data);
export const getUser = (id: string) => api.get(`/users/${id}`).then(r => r.data);

// Chat
export const sendMessage = (to_user_id: string, text: string) =>
  api.post('/messages', { to_user_id, text }).then(r => r.data);
export const getConversation = (userId: string) => api.get(`/messages/${userId}`).then(r => r.data);
export const listConversations = () => api.get('/conversations').then(r => r.data);

// TAP
export const sendTap = (to_user_id: string, tap_type: string) =>
  api.post('/taps', { to_user_id, tap_type }).then(r => r.data);
export const tapsReceived = () => api.get('/taps/received').then(r => r.data);

// Moderation
export const blockUser = (target_user_id: string) =>
  api.post('/block', { target_user_id }).then(r => r.data);
export const reportUser = (target_user_id: string, reason: string) =>
  api.post('/report', { target_user_id, reason }).then(r => r.data);

export const seed = () => api.post('/seed').then(r => r.data);

// Theme - VEIL: violet + gold mask aesthetic
export const theme = {
  bg: '#0A0418',
  surface1: '#160B26',
  surface2: '#22113A',
  violet: '#7C3AED',
  violetDeep: '#5B21B6',
  violetLight: '#A78BFA',
  warm: '#F5B642',          // mask gold (primary CTA)
  warmText: '#1A0E04',
  gold: '#F5B642',
  goldGlow: '#FFD27A',
  textPrimary: '#F8F4FF',
  textSecondary: '#A89BC0',
  blueArrow: '#7DD3FC',
  danger: '#F87171',
  border: 'rgba(167,139,250,0.12)',
};
