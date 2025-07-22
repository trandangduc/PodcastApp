// src/api/apiClient.ts
import axios from 'axios';
import env from '../../constants/config'; // đường dẫn tới file environment.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const auth = axios.create({
  baseURL: env.apiUrl,
  timeout: env.apiTimeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to every request
auth.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


export default auth;

