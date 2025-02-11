// src/api/fileQueries.ts
import { useQuery } from '@tanstack/react-query';
import apiClient from './client';
import { FileObject } from '../types/types'; // Import the type

// Function to fetch files
const fetchFiles = async (): Promise<FileObject[]> => {
  const response = await apiClient.get('/excel/list'); // Assuming the API endpoint is `/files`
  return response.data.files;
};

// React Query hook to fetch files
export const useFilesQuery = () => {
  return useQuery<FileObject[]>({
    queryKey: ['files'],
    queryFn: () => fetchFiles(),
  });
};
