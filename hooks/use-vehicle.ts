import { useVehicle as useVehicleContext } from '@/lib/app-context';

// Re-exporta el hook del contexto para acceso directo
export function useVehicle() {
  return useVehicleContext();
}