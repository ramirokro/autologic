import { 
  createContext, 
  useContext, 
  useState, 
  useEffect, 
  ReactNode 
} from 'react';

// Interfaz para el usuario simplificado
interface LocalUser {
  uid: string;
  id: string; // Agregamos un id para compatibilidad con AuthUser
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
}

// Interfaz para las credenciales del usuario
interface LocalUserCredential {
  user: LocalUser;
}

interface AuthContextType {
  currentUser: LocalUser | null;
  loading: boolean;
  signup: (email: string, password: string, name: string) => Promise<LocalUserCredential>;
  login: (email: string, password: string) => Promise<LocalUserCredential>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Eventos para comunicarse con otros contextos
export const authEvents = {
  onLogin: null as ((user: LocalUser) => void) | null,
  onLogout: null as (() => void) | null,
  addLoginListener: (callback: (user: LocalUser) => void) => {
    authEvents.onLogin = callback;
  },
  addLogoutListener: (callback: () => void) => {
    authEvents.onLogout = callback;
  }
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

// Simulación de base de datos local para usuarios
const userDatabase: { [email: string]: { password: string, user: LocalUser } } = {};

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<LocalUser | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Cargar usuario guardado en localStorage al iniciar
  useEffect(() => {
    const savedUser = localStorage.getItem('autologicUser');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setCurrentUser(user);
      
      // Notificar a los contextos que escuchan eventos de inicio de sesión
      if (authEvents.onLogin) {
        authEvents.onLogin(user);
      }
    }
    setLoading(false);
  }, []);

  // Registro de usuario
  async function signup(email: string, password: string, name: string): Promise<LocalUserCredential> {
    setLoading(true);
    
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          // Comprobar si el usuario ya existe
          if (userDatabase[email]) {
            setLoading(false);
            const error = { code: 'auth/email-already-in-use', message: 'El correo electrónico ya está en uso' };
            return reject(error);
          }
          
          // Crear nuevo usuario
          const uid = 'user_' + Date.now();
          const newUser: LocalUser = {
            uid,
            id: uid, // Usamos el mismo valor para uid e id para compatibilidad
            email,
            displayName: name,
            photoURL: null
          };
          
          // Guardar en base de datos local
          userDatabase[email] = {
            password,
            user: newUser
          };
          
          // Guardar en localStorage para persistencia
          localStorage.setItem('autologicUser', JSON.stringify(newUser));
          
          // Actualizar estado
          setCurrentUser(newUser);
          setLoading(false);
          
          // Notificar a los contextos que escuchan eventos de inicio de sesión
          if (authEvents.onLogin) {
            authEvents.onLogin(newUser);
          }
          
          // Resolver con las credenciales
          resolve({ user: newUser });
        } catch (error) {
          setLoading(false);
          reject(error);
        }
      }, 800); // Simular latencia de red
    });
  }

  // Inicio de sesión
  async function login(email: string, password: string): Promise<LocalUserCredential> {
    setLoading(true);
    
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          // Verificar si el usuario existe
          const userRecord = userDatabase[email];
          
          if (!userRecord) {
            setLoading(false);
            const error = { code: 'auth/user-not-found', message: 'No existe una cuenta con este correo electrónico' };
            return reject(error);
          }
          
          // Verificar contraseña
          if (userRecord.password !== password) {
            setLoading(false);
            const error = { code: 'auth/wrong-password', message: 'Contraseña incorrecta' };
            return reject(error);
          }
          
          // Guardar en localStorage
          localStorage.setItem('autologicUser', JSON.stringify(userRecord.user));
          
          // Actualizar estado
          setCurrentUser(userRecord.user);
          setLoading(false);
          
          // Notificar a los contextos que escuchan eventos de inicio de sesión
          if (authEvents.onLogin) {
            authEvents.onLogin(userRecord.user);
          }
          
          // Resolver con credenciales
          resolve({ user: userRecord.user });
        } catch (error) {
          setLoading(false);
          reject(error);
        }
      }, 800);
    });
  }

  // Cierre de sesión
  async function logout(): Promise<void> {
    setLoading(true);
    
    return new Promise((resolve) => {
      setTimeout(() => {
        localStorage.removeItem('autologicUser');
        setCurrentUser(null);
        
        // Notificar a los contextos que escuchan eventos de cierre de sesión
        if (authEvents.onLogout) {
          authEvents.onLogout();
        }
        
        setLoading(false);
        resolve();
      }, 500);
    });
  }

  // Restablecimiento de contraseña (simulado)
  async function resetPassword(email: string): Promise<void> {
    setLoading(true);
    
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const userRecord = userDatabase[email];
        
        if (!userRecord) {
          setLoading(false);
          const error = { code: 'auth/user-not-found', message: 'No existe una cuenta con este correo electrónico' };
          return reject(error);
        }
        
        setLoading(false);
        resolve();
      }, 800);
    });
  }

  const value = {
    currentUser,
    loading,
    signup,
    login,
    logout,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}