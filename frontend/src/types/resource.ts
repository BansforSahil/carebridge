export interface Resource {
  id: string;
  name: string;
  location: string;
  services: string[];
  openingHours: string;
  contact: string;
  distance?: string;
}

export interface ResourceFilters {
  location?: string;
  service?: string;
  openNow?: boolean;
}

export interface ResourceResponse {
  resources: Resource[];
}
