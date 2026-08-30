import { Resource } from '../types/resource';

export const MOCK_RESOURCES: Resource[] = [
  {
    id: "1",
    name: "City General Hospital",
    location: "123 Health Ave, Downtown",
    services: ["Emergency", "General Healthcare", "Vaccination"],
    openingHours: "Open 24 Hours",
    contact: "+1 555-0100",
    distance: "2.5 km"
  },
  {
    id: "2",
    name: "Community Health Centre",
    location: "456 Oak Street, Westside",
    services: ["General Healthcare", "Maternal Health", "Vaccination"],
    openingHours: "09:00 - 17:00",
    contact: "+1 555-0101",
    distance: "1.2 km"
  },
  {
    id: "3",
    name: "Sunrise Pediatric Clinic",
    location: "789 Pine Road, Eastside",
    services: ["Child Health", "Vaccination", "Nutrition"],
    openingHours: "08:00 - 18:00",
    contact: "+1 555-0102",
    distance: "3.8 km"
  },
  {
    id: "4",
    name: "Wellness Mental Health Center",
    location: "101 Maple Blvd",
    services: ["Mental Wellbeing", "Counseling"],
    openingHours: "10:00 - 20:00",
    contact: "+1 555-0103",
    distance: "4.1 km"
  },
  {
    id: "5",
    name: "Downtown Pharmacy & Clinic",
    location: "202 Elm Street",
    services: ["Vaccination", "General Healthcare"],
    openingHours: "08:00 - 22:00",
    contact: "+1 555-0104",
    distance: "0.8 km"
  }
];
