// src/api/saveFileQueries.ts
import { useMutation } from 'react-query';
import apiClient from './client';
import { Update } from '../types/types';

// Function to save file changes
const saveFileChanges = async (payload: {
  fileId: string;
  updatedData: Update[];
}) => {
  const response = await apiClient.post('/excel/update', payload); // Replace with your save endpoint
  return response.data; // Return the response from the API
};

// React Query hook to save file changes
export const useSaveFileQuery = () => {
  return useMutation(saveFileChanges);
};
