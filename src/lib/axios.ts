// lib/axios.ts
import axios from 'axios';

const axiosInstance = axios.create({
  headers: {
    'Accept': '*/*',
    'User-Agent': 'Prabasi-Odia/1.0',
  },
  timeout: 30000, 
});

export default axiosInstance;