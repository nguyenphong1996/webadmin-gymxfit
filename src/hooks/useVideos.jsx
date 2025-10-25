import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { videosApi } from '../api/videosApi';

export const useFetchVideos = (params = {}) => {
  const queryKey = useMemo(() => ['videos', params], [params]);

  return useQuery({
    queryKey,
    queryFn: () => videosApi.getVideos(params),
    keepPreviousData: true,
  });
};

export const useFetchVideo = (videoId, options = {}) => {
  return useQuery({
    queryKey: ['video', videoId],
    queryFn: () => videosApi.getVideoById(videoId),
    enabled: !!videoId,
    ...options,
  });
};

export const useUploadVideo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ formData, onUploadProgress } = {}) => {
      if (!(formData instanceof FormData)) {
        throw new Error('formData is required to upload video.');
      }

      return videosApi.uploadVideo(formData, { onUploadProgress });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] });
    },
  });
};

export const useDeleteVideo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: videosApi.deleteVideo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] });
    },
  });
};

export const useFetchVideoSubcategories = (category, options = {}) => {
  return useQuery({
    queryKey: ['videos', 'subcategories', category],
    queryFn: () => videosApi.getSubcategories(category),
    enabled: !!category,
    staleTime: 1000 * 60 * 10,
    ...options,
  });
};
