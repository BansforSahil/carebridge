import React, { useState, useEffect } from 'react';
import { Search, Filter, Loader2, MapPin } from 'lucide-react';
import { Resource } from '../types/resource';
import { getResources } from '../services/resourceService';
import ResourceCard from './ResourceCard';

export default function ResourceFinder() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [openNow, setOpenNow] = useState(false);

  const fetchResources = async () => {
    setIsLoading(true);
    try {
      const data = await getResources({
        location: searchQuery,
        service: selectedService,
        openNow: openNow
      });
      setResources(data);
    } catch (error) {
      console.error("Failed to fetch resources", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedService, openNow]); // Refetch on filter change

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchResources();
  };

  const services = ["General Healthcare", "Emergency", "Vaccination", "Child Health", "Maternal Health", "Mental Wellbeing"];

  return (
    <div className="py-8">
      <div className="mb-8 md:mb-10 text-center max-w-3xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-charcoal-900 mb-4">Find Healthcare Resources</h1>
        <p className="text-base md:text-lg text-charcoal-600">Locate hospitals, clinics, and support centers near you.</p>
      </div>

      <div className="bg-white border border-charcoal-200 rounded-2xl p-4 sm:p-6 mb-8 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search size={20} className="text-charcoal-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-12 pr-4 py-3 sm:py-3.5 bg-charcoal-50 border border-charcoal-200 rounded-xl text-charcoal-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
              placeholder="Search by location, facility name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button 
            type="submit"
            className="w-full sm:w-auto px-8 py-3.5 sm:py-3 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors"
          >
            Search
          </button>
        </form>

        <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-4 border-t border-charcoal-100 pt-5 sm:pt-6">
          <div className="flex items-center text-sm font-medium text-charcoal-700 w-full sm:w-auto mb-2 sm:mb-0">
            <Filter size={18} className="mr-2 text-charcoal-400" />
            Filters:
          </div>
          
          <select 
            className="w-full sm:w-auto bg-charcoal-50 border border-charcoal-200 text-charcoal-700 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block p-3 sm:p-2.5 outline-none"
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
          >
            <option value="">All Services</option>
            {services.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <label className="relative flex justify-between sm:inline-flex items-center cursor-pointer w-full sm:w-auto mt-2 sm:mt-0 sm:ml-auto bg-charcoal-50 sm:bg-transparent p-3 sm:p-0 rounded-lg sm:rounded-none border border-charcoal-200 sm:border-transparent">
            <span className="text-sm font-medium text-charcoal-700 sm:mr-3">Open Now (24h)</span>
            <div className="relative">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={openNow}
                onChange={() => setOpenNow(!openNow)}
              />
              <div className="w-11 h-6 bg-charcoal-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </div>
          </label>
        </div>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 size={40} className="text-primary-600 animate-spin mb-4" />
          <p className="text-charcoal-500">Finding resources...</p>
        </div>
      ) : resources.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white border border-charcoal-200 rounded-2xl">
          <div className="w-16 h-16 bg-charcoal-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin size={24} className="text-charcoal-400" />
          </div>
          <h3 className="text-lg font-semibold text-charcoal-900 mb-2">No resources found</h3>
          <p className="text-charcoal-500">Try adjusting your filters or search query.</p>
        </div>
      )}
    </div>
  );
}
