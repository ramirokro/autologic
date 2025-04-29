import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest } from './queryClient';
import { Vehicle } from '@shared/schema';
import { authEvents } from './auth-context';

// Interfaz para filtros de búsqueda de vehículos
interface VehicleFilter {
  year?: number;
  make?: string;
  model?: string;
  engine?: string;
}

// Definición de tipo para autenticación - evita dependencia circular
interface AuthUser {
  id: number | string;
  displayName?: string | null;
}

interface VehicleContextType {
  userVehicles: Vehicle[];
  selectedVehicle: Vehicle | null;
  setSelectedVehicle: (vehicle: Vehicle | null) => void;
  loadUserVehicles: (user: AuthUser | null) => Promise<void>;
  addVehicle: (vehicle: Omit<Vehicle, 'id'>) => Promise<Vehicle>;
  updateVehicle: (id: number, vehicle: Partial<Vehicle>) => Promise<Vehicle>;
  deleteVehicle: (id: number) => Promise<boolean>;
  
  // Selección de vehículos (YMME)
  vehicleFilter: VehicleFilter;
  updateFilter: (filter: Partial<VehicleFilter>) => void;
  years: number[];
  makes: string[];
  models: string[];
  engines: string[];
  fetchFilterOptions: (filter: Partial<VehicleFilter>, field: keyof VehicleFilter) => Promise<void>;
  saveVehicle: (vehicle: Omit<Vehicle, 'id'>) => Promise<void>;
  isSaved: boolean;
  toggleSaved: () => void;
  searchVehicleProducts: () => Promise<string>;
  clearVehicle: () => void;
  
  isLoading: boolean;
  error: string | null;
}

export const VehicleContext = createContext<VehicleContextType | undefined>(undefined);

export function VehicleProvider({ children }: { children: React.ReactNode }) {
  const [userVehicles, setUserVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para el selector de vehículos (YMME)
  const [vehicleFilter, setVehicleFilter] = useState<VehicleFilter>({
    year: undefined,
    make: undefined,
    model: undefined,
    engine: undefined
  });
  const [years, setYears] = useState<number[]>([]);
  const [makes, setMakes] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [engines, setEngines] = useState<string[]>([]);
  const [isSaved, setIsSaved] = useState(false);

  // Registrar eventos de autenticación
  useEffect(() => {
    // Cuando un usuario inicia sesión
    authEvents.addLoginListener((user) => {
      loadUserVehicles(user);
    });
    
    // Cuando un usuario cierra sesión
    authEvents.addLogoutListener(() => {
      setUserVehicles([]);
      setSelectedVehicle(null);
    });
  }, []);
  
  // Cargar vehículos del usuario
  const loadUserVehicles = async (user: AuthUser | null) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Si no hay usuario, limpiamos los vehículos
      if (!user) {
        setUserVehicles([]);
        setSelectedVehicle(null);
        return;
      }
      
      // Si el usuario está autenticado, obtener sus vehículos
      const response = await apiRequest('GET', '/api/user/vehicles');
      const data = await response.json();
      
      setUserVehicles(data);
      
      // Seleccionar el primer vehículo si no hay uno seleccionado
      if (data.length > 0 && !selectedVehicle) {
        setSelectedVehicle(data[0]);
      }
    } catch (error) {
      console.error('Error al cargar los vehículos:', error);
      setError('No se pudieron cargar los vehículos. Por favor, intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Agregar un nuevo vehículo
  const addVehicle = async (vehicleData: Omit<Vehicle, 'id'>) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiRequest('POST', '/api/vehicles', vehicleData);
      const newVehicle = await response.json();
      
      setUserVehicles((prev) => [...prev, newVehicle]);
      
      // Si es el primer vehículo, seleccionarlo automáticamente
      if (userVehicles.length === 0) {
        setSelectedVehicle(newVehicle);
      }
      
      return newVehicle;
    } catch (error) {
      console.error('Error al agregar el vehículo:', error);
      setError('No se pudo agregar el vehículo. Por favor, intenta nuevamente.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Actualizar un vehículo
  const updateVehicle = async (id: number, vehicleData: Partial<Vehicle>) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiRequest('PATCH', `/api/vehicles/${id}`, vehicleData);
      const updatedVehicle = await response.json();
      
      setUserVehicles((prev) => 
        prev.map((vehicle) => (vehicle.id === id ? updatedVehicle : vehicle))
      );
      
      // Si el vehículo actualizado es el seleccionado, actualizar la selección
      if (selectedVehicle && selectedVehicle.id === id) {
        setSelectedVehicle(updatedVehicle);
      }
      
      return updatedVehicle;
    } catch (error) {
      console.error('Error al actualizar el vehículo:', error);
      setError('No se pudo actualizar el vehículo. Por favor, intenta nuevamente.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Eliminar un vehículo
  const deleteVehicle = async (id: number) => {
    try {
      setIsLoading(true);
      setError(null);
      
      await apiRequest('DELETE', `/api/vehicles/${id}`);
      
      setUserVehicles((prev) => prev.filter((vehicle) => vehicle.id !== id));
      
      // Si el vehículo eliminado es el seleccionado, seleccionar otro o ninguno
      if (selectedVehicle && selectedVehicle.id === id) {
        const remaining = userVehicles.filter((vehicle) => vehicle.id !== id);
        setSelectedVehicle(remaining.length > 0 ? remaining[0] : null);
      }
      
      return true;
    } catch (error) {
      console.error('Error al eliminar el vehículo:', error);
      setError('No se pudo eliminar el vehículo. Por favor, intenta nuevamente.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Métodos para el selector de vehículos YMME
  useEffect(() => {
    // Cargar años al iniciar
    fetchFilterOptions({}, 'year');
  }, []);
  
  // Actualiza los filtros de vehículos
  const updateFilter = (filter: Partial<VehicleFilter>) => {
    setVehicleFilter(prev => {
      const newFilter = { ...prev, ...filter };
      
      // Si cambia el año, resetear make, model y engine
      if (filter.year !== undefined && filter.year !== prev.year) {
        newFilter.make = undefined;
        newFilter.model = undefined;
        newFilter.engine = undefined;
      }
      
      // Si cambia la marca, resetear model y engine
      if (filter.make !== undefined && filter.make !== prev.make) {
        newFilter.model = undefined;
        newFilter.engine = undefined;
      }
      
      // Si cambia el modelo, resetear engine
      if (filter.model !== undefined && filter.model !== prev.model) {
        newFilter.engine = undefined;
      }
      
      return newFilter;
    });
  };
  
  // Busca opciones para cada nivel del filtro (años, marcas, modelos, motores)
  const fetchFilterOptions = async (
    filter: Partial<VehicleFilter>,
    field: keyof VehicleFilter
  ) => {
    try {
      setIsLoading(true);
      
      // Construir endpoint según el campo
      let endpoint = '/api/vehicles';
      
      if (field === 'year') {
        endpoint = '/api/vehicles/year';
      } else if (field === 'make') {
        endpoint = `/api/vehicles/make?year=${filter.year}`;
      } else if (field === 'model') {
        endpoint = `/api/vehicles/model?year=${filter.year}&make=${filter.make}`;
      } else if (field === 'engine') {
        endpoint = `/api/vehicles/engine?year=${filter.year}&make=${filter.make}&model=${filter.model}`;
      }
      
      const response = await apiRequest('GET', endpoint);
      const data = await response.json();
      
      // Actualizar el estado correspondiente
      switch (field) {
        case 'year':
          setYears(data);
          break;
        case 'make':
          setMakes(data);
          break;
        case 'model':
          setModels(data);
          break;
        case 'engine':
          setEngines(data);
          break;
      }
      
    } catch (error) {
      console.error(`Error al obtener opciones de ${field}:`, error);
      setError(`No se pudieron cargar las opciones de ${field}.`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Guarda el vehículo seleccionado
  const saveVehicle = async (vehicle: Omit<Vehicle, 'id'>) => {
    try {
      setIsLoading(true);
      const newVehicle = await addVehicle(vehicle);
      setSelectedVehicle(newVehicle);
      setIsSaved(true);
    } catch (error) {
      console.error('Error al guardar el vehículo:', error);
      setError('No se pudo guardar el vehículo.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Alterna el estado de guardado
  const toggleSaved = () => {
    setIsSaved(prev => !prev);
  };
  
  // Busca productos compatibles con el vehículo seleccionado
  const searchVehicleProducts = async (): Promise<string> => {
    if (!vehicleFilter.year || !vehicleFilter.make || !vehicleFilter.model) {
      throw new Error('Se requiere al menos año, marca y modelo para buscar productos.');
    }
    
    // Construir queryString para la ruta de catálogo
    let queryString = `/catalog?year=${vehicleFilter.year}&make=${vehicleFilter.make}&model=${vehicleFilter.model}`;
    
    if (vehicleFilter.engine) {
      queryString += `&engine=${vehicleFilter.engine}`;
    }
    
    return queryString;
  };
  
  // Limpia el vehículo seleccionado
  const clearVehicle = () => {
    setSelectedVehicle(null);
  };

  const value = {
    userVehicles,
    selectedVehicle,
    setSelectedVehicle,
    loadUserVehicles,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    
    // Añadir propiedades para VehicleSelector
    vehicleFilter,
    updateFilter,
    years,
    makes,
    models,
    engines,
    fetchFilterOptions,
    saveVehicle,
    isSaved,
    toggleSaved,
    searchVehicleProducts,
    clearVehicle,
    
    isLoading,
    error
  };

  return (
    <VehicleContext.Provider value={value}>
      {children}
    </VehicleContext.Provider>
  );
}

export function useVehicle() {
  const context = useContext(VehicleContext);
  if (context === undefined) {
    throw new Error('useVehicle debe ser usado dentro de un VehicleProvider');
  }
  return context;
}