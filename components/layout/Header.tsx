import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { useAuth, useVehicle } from '@/lib/app-context';
import AutologicLogo from '@/components/ui/autologic-logo';
import { 
  User, 
  Search, 
  Menu, 
  X,
  LogOut,
  LogIn,
  Terminal,
  Cpu
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

// Componente para enlaces de navegación
interface NavLinkProps {
  href: string;
  label: string;
  currentPath: string;
}

function NavLink({ href, label, currentPath }: NavLinkProps) {
  const isActive = currentPath === href || 
    (href !== '/' && currentPath.startsWith(href));
  
  return (
    <Link href={href} className={`font-mono text-xs ${isActive ? 'text-green-400' : 'text-zinc-500 hover:text-zinc-300'}`}>
      {label}
    </Link>
  );
}

// Componente principal del Header
export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [location, navigate] = useLocation();
  const { selectedVehicle } = useVehicle();
  const { currentUser, logout } = useAuth();
  
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  // Establecer dark mode siempre
  if (!document.documentElement.classList.contains('dark')) {
    document.documentElement.classList.add('dark');
    document.documentElement.classList.remove('light');
    // Guardar tema en localStorage
    const themeData = {
      primary: "hsl(142, 70%, 45%)",
      variant: "tint",
      appearance: "dark",
      radius: 0.5
    };
    localStorage.setItem('theme', JSON.stringify(themeData));
  }
  
  return (
    <header className="relative border-b border-zinc-800 bg-black">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <Link href="/" className="flex items-center">
            <div className="flex items-center gap-2">
              <AutologicLogo size="sm" />
              <span className="ml-1 text-xs bg-zinc-800 px-1 py-0.5 rounded text-green-400 font-mono">v3.5</span>
            </div>
          </Link>
          <nav className="hidden md:flex space-x-6">
            <NavLink href="/" label="INICIO" currentPath={location} />
            <NavLink href="/diagnostics" label="DIAGNÓSTICO" currentPath={location} />
            <NavLink href="/history" label="HISTORIAL" currentPath={location} />
          </nav>
        </div>
        
        <div className="flex items-center space-x-3">
          <Link href="/">
            <Button 
              variant="ghost"
              size="sm"
              className="border border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-green-400 hover:bg-zinc-800 hover:border-zinc-700 font-mono text-xs"
            >
              <Terminal className="h-3.5 w-3.5 mr-1.5 text-green-400" />
              INICIO
            </Button>
          </Link>
          
          {currentUser ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative" aria-label="Opciones de usuario">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {currentUser.displayName 
                        ? currentUser.displayName.charAt(0).toUpperCase() 
                        : currentUser.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    {currentUser.displayName && (
                      <p className="font-medium">{currentUser.displayName}</p>
                    )}
                    <p className="w-[200px] truncate text-sm text-muted-foreground">
                      {currentUser.email}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="w-full cursor-pointer">Mi Perfil</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/my-vehicles" className="w-full cursor-pointer">Mis Vehículos</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/diagnostics-history" className="w-full cursor-pointer">Historial de Diagnósticos</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-red-500 focus:bg-red-50 cursor-pointer"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Cerrar Sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/login" className="flex items-center gap-1">
                  <LogIn className="h-4 w-4" />
                  Iniciar Sesión
                </Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/signup">Registrarse</Link>
              </Button>
            </div>
          )}
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden"
            onClick={toggleMenu}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden py-3 px-4 border-t border-neutral-200">
          <div className="flex flex-col space-y-3">
            <Link href="/" className="text-muted-foreground hover:text-foreground py-2">
              Inicio
            </Link>
            <Link href="/diagnostics" className="text-muted-foreground hover:text-foreground py-2">
              Diagnóstico
            </Link>
            <Link href="/history" className="text-muted-foreground hover:text-foreground py-2">
              Historial
            </Link>
            
            {/* Opciones de autenticación en menú móvil */}
            {!currentUser ? (
              <>
                <Link href="/login" className="text-muted-foreground hover:text-foreground py-2 flex items-center">
                  <LogIn className="h-4 w-4 mr-2" />
                  Iniciar Sesión
                </Link>
                <Link href="/signup" className="text-muted-foreground hover:text-foreground py-2 flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Registrarse
                </Link>
              </>
            ) : (
              <>
                <div className="py-2 flex items-center">
                  <Avatar className="h-6 w-6 mr-2">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {currentUser.displayName 
                        ? currentUser.displayName.charAt(0).toUpperCase() 
                        : currentUser.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium truncate">
                    {currentUser.displayName || currentUser.email}
                  </span>
                </div>
                <Link href="/profile" className="text-muted-foreground hover:text-foreground py-2 pl-8">
                  Mi Perfil
                </Link>
                <Link href="/my-vehicles" className="text-muted-foreground hover:text-foreground py-2 pl-8">
                  Mis Vehículos
                </Link>
                <Link href="/diagnostics-history" className="text-muted-foreground hover:text-foreground py-2 pl-8">
                  Historial de Diagnósticos
                </Link>
                <button 
                  onClick={handleLogout}
                  className="text-red-500 hover:text-red-700 py-2 flex items-center w-full text-left"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Cerrar Sesión
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}