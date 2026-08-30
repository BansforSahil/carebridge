import { ResourceResponse, ResourceFilters, Resource } from '../types/resource';
import { fetchApi, USE_MOCK_DATA } from './api';
import { MOCK_RESOURCES } from '../data/mockResources';

export async function getResources(filters?: ResourceFilters): Promise<Resource[]> {
  if (USE_MOCK_DATA) {
    return new Promise((resolve) => {
      setTimeout(() => {
        let filtered = [...MOCK_RESOURCES];
        
        if (filters?.service) {
          const s = filters.service.toLowerCase();
          filtered = filtered.filter(r => 
            r.services.some(srv => srv.toLowerCase().includes(s))
          );
        }
        
        if (filters?.location) {
          const l = filters.location.toLowerCase();
          filtered = filtered.filter(r => 
            r.location.toLowerCase().includes(l) || 
            r.name.toLowerCase().includes(l)
          );
        }
        
        // Mock openNow logic (just an example, not real time logic)
        if (filters?.openNow) {
           filtered = filtered.filter(r => r.openingHours.includes("24"));
        }
        
        resolve(filtered);
      }, 1000);
    });
  }

  // Build query string
  const params = new URLSearchParams();
  if (filters?.location) params.append('location', filters.location);
  if (filters?.service) params.append('service', filters.service);
  if (filters?.openNow) params.append('openNow', 'true');

  const queryString = params.toString() ? `?${params.toString()}` : '';
  
  const response = await fetchApi<ResourceResponse>(`/resources${queryString}`);
  return response.resources;
}
