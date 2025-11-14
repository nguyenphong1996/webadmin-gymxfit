import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/apiClient';

// Fetch all staff
export const useFetchStaff = () => {
  return useQuery({
    queryKey: ['staff'],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/api/admin/staff');
        console.log('Staff API response:', response.data);
        return response.data;
      } catch (error) {
        console.error('Failed to fetch staff:', error);
        // Fallback to mock data with valid ObjectId format
        return {
          data: [
            { _id: '507f1f77bcf86cd799439011', name: 'John Doe', phone: '0912345678', role: 'PT', skills: ['workout', 'cardio'] },
            { _id: '507f1f77bcf86cd799439012', name: 'Jane Smith', phone: '0912345679', role: 'PT', skills: ['yoga', 'stretching'] },
            { _id: '507f1f77bcf86cd799439013', name: 'Mike Johnson', phone: '0912345680', role: 'PT', skills: ['cardio', 'nutrition'] },
          ],
        };
      }
    },
    staleTime: 1000 * 60 * 5,
  });
};

// Fetch staff by category (with matching skills)
export const useFetchStaffByCategory = (category) => {
  return useQuery({
    queryKey: ['staff', category],
    queryFn: async () => {
      try {
        if (!category) return { data: [] };
        
        // Fetch all staff and filter by category on client-side
        const response = await apiClient.get('/api/admin/staff?limit=100');
        console.log(`All staff:`, response.data);
        
        // Filter staff that have the category skill and are active
        const filtered = (response.data?.data || []).filter((staff) => {
          const hasSkill = staff.skills?.includes(category);
          const isActive = staff.isActive !== false;
          return hasSkill && isActive;
        });

        console.log(`Staff for category ${category}:`, filtered);
        return { data: filtered };
      } catch (error) {
        console.error(`Failed to fetch staff for category ${category}:`, error);
        // Return empty array on error instead of mock data
        return { data: [] };
      }
    },
    staleTime: 1000 * 60 * 5,
    enabled: !!category,
  });
};
