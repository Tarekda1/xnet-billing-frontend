// src/api/presignedUrlQueries.ts
import { useMutation } from '@tanstack/react-query';
import apiClient from './client';

interface PresignedUrlResponse {
  url: string;
}

const fetchPresignedUrl = async (
  fileName: string,
): Promise<PresignedUrlResponse> => {
  const response = await apiClient.post('/excel/signedUrl', {
    fileName,
  });
  return response.data;
};

export const usePresignedUrlMutation = () => {
  return useMutation({
    mutationFn: (fileName: string) => fetchPresignedUrl(fileName),
  });
};
