// src/api/client.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://4au48zl3te.execute-api.us-east-1.amazonaws.com/dev/api', // Replace with your actual API URL
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;
