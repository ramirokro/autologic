import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiRequest } from './queryClient';
import { Vehicle } from '@shared/schema';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail, 
  updateProfile,
  User as FirebaseUser,
  UserCredential
} from 'firebase/auth';
import { auth } from './firebase';

// Interfaces para autenticación
interface LocalUser {
  uid: string;
  id: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
}

interface LocalUserCredential {
  user: LocalUser;
}

// Interfaz para filtros de búsqueda de vehículos
interface VehicleFilter {
  year?: number;
  make?: string;
  model?: string;
  engine?: string;
}

// Definición del contexto global de la aplicación
interface AppContextType {
  // Autenticación
  currentUser: LocalUser | null;
  loading: boolean;
  signup: (email: string, password: string, name: string) => Promise<LocalUserCredential>;
  login: (email: string, password: string) => Promise<LocalUserCredential>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  
  // Vehículos
  userVehicles: Vehicle[];
  selectedVehicle: Vehicle | null;
  setSelectedVehicle: (vehicle: Vehicle | null) => void;
  addVehicle: (vehicle: Omit<Vehicle, 'id'>) => Promise<Vehicle>;
  updateVehicle: (id: number, vehicle: Partial<Vehicle>) => Promise<Vehicle>;
  deleteVehicle: (id: number) => Promise<boolean>;
  
  // Selector de vehículos (YMME)
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
  
  vehicleIsLoading: boolean;
  vehicleError: string | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp debe ser usado dentro de un AppProvider');
  }
  return context;
}

export function useAuth() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AppProvider');
  }
  
  // Devolver solo las propiedades relacionadas con autenticación
  const { 
    currentUser, 
    loading, 
    signup, 
    login, 
    logout, 
    resetPassword 
  } = context;
  
  return { currentUser, loading, signup, login, logout, resetPassword };
}

export function useVehicle() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useVehicle debe ser usado dentro de un AppProvider');
  }
  
  // Devolver solo las propiedades relacionadas con vehículos
  const { 
    userVehicles,
    selectedVehicle,
    setSelectedVehicle,
    addVehicle,
    updateVehicle,
    deleteVehicle,
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
    vehicleIsLoading: isLoading,
    vehicleError: error
  } = context;
  
  return {
    userVehicles,
    selectedVehicle,
    setSelectedVehicle,
    addVehicle,
    updateVehicle,
    deleteVehicle,
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
}

interface AppProviderProps {
  children: ReactNode;
}

// Función auxiliar para convertir FirebaseUser a LocalUser
const mapFirebaseUserToLocalUser = (user: FirebaseUser): LocalUser => {
  return {
    uid: user.uid,
    id: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL
  };
};

export function AppProvider({ children }: AppProviderProps) {
  // Estado para autenticación
  const [currentUser, setCurrentUser] = useState<LocalUser | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Estado para vehículos
  const [userVehicles, setUserVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [vehicleIsLoading, setVehicleIsLoading] = useState(false);
  const [vehicleError, setVehicleError] = useState<string | null>(null);
  
  // Estado para el selector de vehículos (YMME)
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
  
  // Configurar un listener para los cambios de estado de autenticación en Firebase
  useEffect(() => {
    setLoading(true);
    
    // Este listener se activará cada vez que cambie el estado de autenticación
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        // Si hay un usuario autenticado, convertirlo al formato local y guardarlo
        const localUser = mapFirebaseUserToLocalUser(user);
        setCurrentUser(localUser);
        loadUserVehicles(localUser);
      } else {
        // Si no hay usuario autenticado, limpiar el estado
        setCurrentUser(null);
        setUserVehicles([]);
        setSelectedVehicle(null);
      }
      setLoading(false);
    });
    
    // Limpieza: desuscribirse del listener cuando el componente se desmonte
    return () => unsubscribe();
  }, []);
  
  // Cargar años al iniciar
  useEffect(() => {
    fetchFilterOptions({}, 'year');
  }, []);
  
  // MÉTODOS DE AUTENTICACIÓN
  
  // Registro de usuario con Firebase
  async function signup(email: string, password: string, name: string): Promise<LocalUserCredential> {
    setLoading(true);
    
    try {
      try {
        // Intentar crear usuario en Firebase primero
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // Actualizar el perfil con el nombre
        await updateProfile(userCredential.user, {
          displayName: name
        });
        
        // Convertir al formato local
        const localUser = mapFirebaseUserToLocalUser(userCredential.user);
        
        return { user: localUser };
      } catch (firebaseError: any) {
        console.error("Error de registro en Firebase:", firebaseError);
        
        // Si hay un error de configuración, usar el sistema local como respaldo
        if (firebaseError.code === 'auth/configuration-not-found' || 
            firebaseError.code === 'auth/internal-error') {
          console.log("Usando sistema de autenticación local de respaldo");
          
          // Comprobar si el usuario ya existe en el almacenamiento local
          const localUserStorage = localStorage.getItem('autologic_local_users');
          const localUsers = localUserStorage ? JSON.parse(localUserStorage) : {};
          
          if (localUsers[email]) {
            throw { code: 'auth/email-already-in-use', message: 'El correo electrónico ya está en uso' };
          }
          
          // Crear nuevo usuario local
          const uid = 'local_user_' + Date.now();
          const newUser: LocalUser = {
            uid,
            id: uid,
            email,
            displayName: name,
            photoURL: null
          };
          
          // Guardar en localStorage
          localUsers[email] = {
            password,
            user: newUser
          };
          localStorage.setItem('autologic_local_users', JSON.stringify(localUsers));
          
          // Guardar el usuario actual en localStorage
          localStorage.setItem('autologic_current_user', JSON.stringify(newUser));
          
          // Actualizar estado
          setCurrentUser(newUser);
          
          return { user: newUser };
        } else {
          // Si es otro tipo de error, propagarlo
          throw firebaseError;
        }
      }
    } catch (error: any) {
      console.error("Error de registro:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  // Inicio de sesión con Firebase
  async function login(email: string, password: string): Promise<LocalUserCredential> {
    setLoading(true);
    
    try {
      try {
        // Intentar iniciar sesión en Firebase primero
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        
        // Convertir al formato local
        const localUser = mapFirebaseUserToLocalUser(userCredential.user);
        
        return { user: localUser };
      } catch (firebaseError: any) {
        console.error("Error de inicio de sesión en Firebase:", firebaseError);
        
        // Si hay un error de configuración, usar el sistema local como respaldo
        if (firebaseError.code === 'auth/configuration-not-found' || 
            firebaseError.code === 'auth/internal-error') {
          console.log("Usando sistema de autenticación local para inicio de sesión");
          
          // Buscar el usuario en el almacenamiento local
          const localUserStorage = localStorage.getItem('autologic_local_users');
          const localUsers = localUserStorage ? JSON.parse(localUserStorage) : {};
          
          if (!localUsers[email]) {
            throw { code: 'auth/user-not-found', message: 'No existe un usuario con este correo electrónico' };
          }
          
          const storedUser = localUsers[email];
          
          // Verificar la contraseña
          if (storedUser.password !== password) {
            throw { code: 'auth/wrong-password', message: 'La contraseña es incorrecta' };
          }
          
          // Iniciar sesión con el usuario local
          const user = storedUser.user;
          
          // Guardar el usuario actual en localStorage
          localStorage.setItem('autologic_current_user', JSON.stringify(user));
          
          // Actualizar estado
          setCurrentUser(user);
          
          return { user };
        } else {
          // Si es otro tipo de error, propagarlo
          throw firebaseError;
        }
      }
    } catch (error: any) {
      console.error("Error de inicio de sesión:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  // Cierre de sesión con Firebase
  async function logout(): Promise<void> {
    setLoading(true);
    
    try {
      try {
        // Intentar cerrar sesión en Firebase
        await signOut(auth);
        // El listener onAuthStateChanged se encargará de limpiar el estado del usuario
      } catch (firebaseError: any) {
        console.error("Error al cerrar sesión en Firebase:", firebaseError);
        
        // Si hay un error de configuración, usar el sistema local como respaldo
        if (firebaseError.code === 'auth/configuration-not-found' || 
            firebaseError.code === 'auth/internal-error') {
          console.log("Usando sistema local para cerrar sesión");
          
          // Limpiar el usuario actual del localStorage
          localStorage.removeItem('autologic_current_user');
          
          // Limpiar el estado
          setCurrentUser(null);
        } else {
          // Si es otro tipo de error, propagarlo
          throw firebaseError;
        }
      }
    } catch (error: any) {
      console.error("Error al cerrar sesión:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  // Restablecimiento de contraseña con Firebase
  async function resetPassword(email: string): Promise<void> {
    setLoading(true);
    
    try {
      try {
        // Intentar enviar correo de restablecimiento de contraseña con Firebase
        await sendPasswordResetEmail(auth, email);
      } catch (firebaseError: any) {
        console.error("Error al restablecer la contraseña en Firebase:", firebaseError);
        
        // Si hay un error de configuración, usar el sistema local como respaldo
        if (firebaseError.code === 'auth/configuration-not-found' || 
            firebaseError.code === 'auth/internal-error') {
          console.log("Usando sistema local para simular restablecimiento de contraseña");
          
          // Verificar si el usuario existe en el almacenamiento local
          const localUserStorage = localStorage.getItem('autologic_local_users');
          const localUsers = localUserStorage ? JSON.parse(localUserStorage) : {};
          
          if (!localUsers[email]) {
            throw { code: 'auth/user-not-found', message: 'No existe un usuario con este correo electrónico' };
          }
          
          // En un caso real, aquí enviaríamos un correo
          // Como es local, simplemente simulamos que el correo fue enviado
          console.log(`Se ha simulado el envío de un correo de restablecimiento a ${email}`);
          
          // Mostrar contraseña actual (solo para desarrollo)
          console.log(`Contraseña actual (desarrollo): ${localUsers[email].password}`);
        } else {
          // Si es otro tipo de error, propagarlo
          throw firebaseError;
        }
      }
    } catch (error: any) {
      console.error("Error al restablecer la contraseña:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }
  
  // MÉTODOS DE VEHÍCULOS
  
  // Cargar vehículos del usuario
  const loadUserVehicles = async (user: LocalUser | null) => {
    try {
      setVehicleIsLoading(true);
      setVehicleError(null);
      
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
      setVehicleError('No se pudieron cargar los vehículos. Por favor, intenta nuevamente.');
    } finally {
      setVehicleIsLoading(false);
    }
  };

  // Agregar un nuevo vehículo
  const addVehicle = async (vehicleData: Omit<Vehicle, 'id'>) => {
    try {
      setVehicleIsLoading(true);
      setVehicleError(null);
      
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
      setVehicleError('No se pudo agregar el vehículo. Por favor, intenta nuevamente.');
      throw error;
    } finally {
      setVehicleIsLoading(false);
    }
  };

  // Actualizar un vehículo
  const updateVehicle = async (id: number, vehicleData: Partial<Vehicle>) => {
    try {
      setVehicleIsLoading(true);
      setVehicleError(null);
      
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
      setVehicleError('No se pudo actualizar el vehículo. Por favor, intenta nuevamente.');
      throw error;
    } finally {
      setVehicleIsLoading(false);
    }
  };

  // Eliminar un vehículo
  const deleteVehicle = async (id: number) => {
    try {
      setVehicleIsLoading(true);
      setVehicleError(null);
      
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
      setVehicleError('No se pudo eliminar el vehículo. Por favor, intenta nuevamente.');
      throw error;
    } finally {
      setVehicleIsLoading(false);
    }
  };
  
  // MÉTODOS PARA EL SELECTOR DE VEHÍCULOS (YMME)
  
  // Actualiza los filtros de vehículos
  const updateFilter = (filter: Partial<VehicleFilter>) => {
    console.log("AppContext - updateFilter - Recibido:", filter);
    
    setVehicleFilter(prev => {
      console.log("AppContext - updateFilter - Estado previo:", prev);
      const newFilter = { ...prev, ...filter };
      console.log("AppContext - updateFilter - Nuevo estado inicial:", newFilter);
      
      // Si cambia el año, resetear make, model y engine
      if (filter.year !== undefined && filter.year !== prev.year) {
        console.log("AppContext - updateFilter - Año cambiado, reseteando make/model/engine");
        newFilter.make = undefined;
        newFilter.model = undefined;
        newFilter.engine = undefined;
      }
      
      // Si cambia la marca, resetear model y engine
      if (filter.make !== undefined && filter.make !== prev.make) {
        console.log("AppContext - updateFilter - Marca cambiada, reseteando model/engine");
        newFilter.model = undefined;
        newFilter.engine = undefined;
      }
      
      // Si cambia el modelo, resetear engine
      if (filter.model !== undefined && filter.model !== prev.model) {
        console.log("AppContext - updateFilter - Modelo cambiado, reseteando engine");
        newFilter.engine = undefined;
      }
      
      console.log("AppContext - updateFilter - Estado final:", newFilter);
      return newFilter;
    });
  };
  
  // Busca opciones para cada nivel del filtro (años, marcas, modelos, motores)
  const fetchFilterOptions = async (
    filter: Partial<VehicleFilter>,
    field: keyof VehicleFilter
  ) => {
    try {
      console.log(`AppContext - fetchFilterOptions - Obteniendo opciones para ${field}`, filter);
      setVehicleIsLoading(true);
      
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
      
      console.log(`AppContext - fetchFilterOptions - Consultando endpoint: ${endpoint}`);
      const response = await apiRequest('GET', endpoint);
      const data = await response.json();
      console.log(`AppContext - fetchFilterOptions - Datos recibidos:`, data);
      
      // Actualizar el estado correspondiente
      switch (field) {
        case 'year':
          console.log(`AppContext - fetchFilterOptions - Actualizando años:`, data);
          setYears(data);
          break;
        case 'make':
          console.log(`AppContext - fetchFilterOptions - Actualizando marcas:`, data);
          setMakes(data);
          break;
        case 'model':
          console.log(`AppContext - fetchFilterOptions - Actualizando modelos:`, data);
          setModels(data);
          break;
        case 'engine':
          console.log(`AppContext - fetchFilterOptions - Actualizando motores:`, data);
          setEngines(data);
          break;
      }
      
    } catch (error) {
      console.error(`Error al obtener opciones de ${field}:`, error);
      setVehicleError(`No se pudieron cargar las opciones de ${field}.`);
    } finally {
      setVehicleIsLoading(false);
    }
  };
  
  // Guarda el vehículo seleccionado
  const saveVehicle = async (vehicle: Omit<Vehicle, 'id'>) => {
    try {
      setVehicleIsLoading(true);
      const newVehicle = await addVehicle(vehicle);
      setSelectedVehicle(newVehicle);
      setIsSaved(true);
    } catch (error) {
      console.error('Error al guardar el vehículo:', error);
      setVehicleError('No se pudo guardar el vehículo.');
    } finally {
      setVehicleIsLoading(false);
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
    // Propiedades de autenticación
    currentUser,
    loading,
    signup,
    login,
    logout,
    resetPassword,
    
    // Propiedades de vehículos
    userVehicles,
    selectedVehicle,
    setSelectedVehicle,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    
    // Propiedades para VehicleSelector
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
    
    vehicleIsLoading,
    vehicleError
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}