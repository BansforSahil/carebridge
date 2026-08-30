import React from 'react';
import { Resource } from '../types/resource';
import { MapPin, Phone, Clock, Stethoscope, Navigation } from 'lucide-react';

interface ResourceCardProps {
  resource: Resource;
}

export default function ResourceCard({ resource }: ResourceCardProps) {
  return (
    <div className="bg-white border border-charcoal-200 rounded-2xl p-5 sm:p-6 hover:border-primary-400 hover:shadow-md transition-all h-full flex flex-col">
      <div className="flex flex-wrap justify-between items-start gap-2 mb-4">
        <h3 className="text-lg font-bold text-charcoal-900 leading-tight flex-1 min-w-[200px]">{resource.name}</h3>
        {resource.distance && (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-charcoal-50 text-xs font-medium text-charcoal-600 border border-charcoal-200 whitespace-nowrap">
            <MapPin size={12} className="mr-1" />
            {resource.distance}
          </span>
        )}
      </div>

      <div className="space-y-3 mb-6 flex-grow">
        <div className="flex items-start text-sm text-charcoal-600">
          <MapPin size={16} className="mr-3 mt-0.5 flex-shrink-0 text-charcoal-400" />
          <span>{resource.location}</span>
        </div>
        
        <div className="flex items-start text-sm text-charcoal-600">
          <Clock size={16} className="mr-3 mt-0.5 flex-shrink-0 text-charcoal-400" />
          <span>{resource.openingHours}</span>
        </div>

        <div className="flex items-start text-sm text-charcoal-600">
          <Phone size={16} className="mr-3 mt-0.5 flex-shrink-0 text-charcoal-400" />
          <span>{resource.contact}</span>
        </div>

        <div className="flex items-start text-sm text-charcoal-600 pt-2">
          <Stethoscope size={16} className="mr-3 mt-0.5 flex-shrink-0 text-charcoal-400" />
          <div className="flex flex-wrap gap-1.5">
            {resource.services.map((service, idx) => (
              <span key={idx} className="inline-flex px-2 py-0.5 rounded bg-primary-50 text-[11px] font-medium text-primary-700 border border-primary-100">
                {service}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex space-x-3 mt-auto pt-4 border-t border-charcoal-100">
        <button className="flex-1 flex items-center justify-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors">
          View Details
        </button>
        <button className="flex items-center justify-center px-4 py-2 bg-white border border-charcoal-200 text-charcoal-700 text-sm font-medium rounded-lg hover:bg-charcoal-50 transition-colors" aria-label="Get Directions">
          <Navigation size={18} />
        </button>
      </div>
    </div>
  );
}
