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

export const tapsCount = () => api.get('/taps/count').then(r => r.data);
export const activateBoost = () => api.post('/boost/activate').then(r => r.data);
export const getMatches = () => api.get('/matches').then(r => r.data);
export const dailyPicks = () => api.get('/users/daily-picks').then(r => r.data);

export const seed = () => api.post('/seed').then(r => r.data);

// Gifts (Élite tier)
export const sendGift = (to_user_id: string, gift_type: string) =>
  api.post('/gifts/send', { to_user_id, gift_type }).then(r => r.data);

// Reveal Filter (Privé tier)
export const getRevealStatus = (user_id: string) =>
  api.get(`/reveal/${user_id}`).then(r => r.data);
export const revealNow = (user_id: string) =>
  api.post(`/reveal/${user_id}`).then(r => r.data);

// Gift catalog (UI helper)
export const GIFT_CATALOG = [
  { id: 'golden_mask',  name: 'Máscara Dorada',  emoji: '🎭', color: '#D4B886', tier: 'free',     subtitle: 'Misterio y elegancia' },
  { id: 'crystal_rose', name: 'Rosa de Cristal', emoji: '🌹', color: '#F5C2D8', tier: 'free',     subtitle: 'Belleza eterna' },
  { id: 'silk_veil',    name: 'Velo de Seda',    emoji: '🕊️', color: '#B5C7B7', tier: 'free',     subtitle: 'Suavidad infinita' },
  { id: 'emerald_heart',name: 'Corazón Esmeralda',emoji: '💚', color: '#5ABE94', tier: 'elite',   subtitle: 'Conexión profunda' },
  { id: 'diamond',      name: 'Diamante',         emoji: '💎', color: '#B6E8F0', tier: 'elite',   subtitle: 'Lujo absoluto' },
];

// Theme - VEIL: deep emerald + gold elegance
export const theme = {
  bg: '#0A2620',
  bgDeep: '#061814',
  surface1: '#0F2E27',
  surface2: '#143A30',
  surface3: '#1A4A3D',
  violet: '#1F5A48',          // legacy compat (now emerald accent)
  violetDeep: '#0F3A2E',
  violetMid: '#175040',
  violetLight: '#2E7A60',
  warm: '#E8D9B8',
  warmText: '#1A1408',
  gold: '#D4B886',
  goldGlow: '#F0E0BC',
  cream: '#E8D9B8',
  textPrimary: '#F8F4ED',
  textSecondary: '#A8AFA0',
  textMuted: '#6B7567',
  blueArrow: '#7DD3C0',
  danger: '#E07060',
  success: '#5ABE94',
  border: 'rgba(212,184,134,0.15)',
  glassDark: 'rgba(15,46,39,0.7)',
};
