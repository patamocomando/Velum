
import { UserLocation } from './types';

/**
 * Fórmula de Haversine para calcular distância entre dois pontos geográficos em KM
 */
export function calculateDistance(loc1: UserLocation, loc2: UserLocation): number {
  const R = 6371; // Raio da Terra em KM
  const dLat = (loc2.lat - loc1.lat) * Math.PI / 180;
  const dLon = (loc2.lng - loc1.lng) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(loc1.lat * Math.PI / 180) * Math.cos(loc2.lat * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return Math.round(R * c);
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}
