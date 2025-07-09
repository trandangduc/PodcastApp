// src/api/apiClient.ts
import axios from 'axios';
import env from '../../constants/config'; // đường dẫn tới file environment.ts

const auth = axios.create({
  baseURL: env.apiUrl,
  timeout: env.apiTimeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default auth;
