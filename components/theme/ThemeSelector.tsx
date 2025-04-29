import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, Palette } from 'lucide-react';
// Imports simplificados

// Define los temas disponibles
const THEMES = [
  // Temas oscuros
  {
    name: 'Azul oscuro (predeterminado)',
    primary: 'hsl(226, 100%, 64%)',
    variant: 'tint',
    appearance: 'dark',
    radius: 0.6,
  },
  {
    name: 'Verde oscuro',
    primary: 'hsl(160, 100%, 40%)',
    variant: 'tint',
    appearance: 'dark',
    radius: 0.6,
  },
  {
    name: 'Púrpura oscuro',
    primary: 'hsl(280, 100%, 60%)',
    variant: 'tint',
    appearance: 'dark',
    radius: 0.6,
  },
  {
    name: 'Rojo oscuro',
    primary: 'hsl(350, 100%, 60%)',
    variant: 'tint',
    appearance: 'dark',
    radius: 0.6,
  },
  {
    name: 'Naranja oscuro',
    primary: 'hsl(32, 100%, 50%)',
    variant: 'tint',
    appearance: 'dark',
    radius: 0.6,
  },
  {
    name: 'Turquesa oscuro',
    primary: 'hsl(174, 100%, 45%)',
    variant: 'tint',
    appearance: 'dark',
    radius: 0.6,
  },
  {
    name: 'Ámbar oscuro',
    primary: 'hsl(45, 100%, 50%)',
    variant: 'tint',
    appearance: 'dark',
    radius: 0.6,
  },
  {
    name: 'Rosa oscuro',
    primary: 'hsl(330, 100%, 65%)',
    variant: 'tint', 
    appearance: 'dark',
    radius: 0.6,
  },
  
  // Temas claros
  {
    name: 'Azul claro',
    primary: 'hsl(226, 100%, 64%)',
    variant: 'tint',
    appearance: 'light',
    radius: 0.6,
  },
  {
    name: 'Verde claro',
    primary: 'hsl(160, 100%, 40%)',
    variant: 'tint',
    appearance: 'light',
    radius: 0.6,
  },
  {
    name: 'Púrpura claro',
    primary: 'hsl(280, 100%, 60%)',
    variant: 'tint',
    appearance: 'light',
    radius: 0.6,
  },
  {
    name: 'Rojo claro',
    primary: 'hsl(350, 100%, 60%)',
    variant: 'tint',
    appearance: 'light',
    radius: 0.6,
  },
  {
    name: 'Naranja claro',
    primary: 'hsl(32, 100%, 50%)',
    variant: 'tint',
    appearance: 'light',
    radius: 0.6,
  },
  {
    name: 'Turquesa claro',
    primary: 'hsl(174, 100%, 45%)',
    variant: 'tint',
    appearance: 'light',
    radius: 0.6,
  },
  {
    name: 'Ámbar claro',
    primary: 'hsl(45, 100%, 50%)',
    variant: 'tint',
    appearance: 'light',
    radius: 0.6,
  },
  {
    name: 'Rosa claro',
    primary: 'hsl(330, 100%, 65%)',
    variant: 'tint',
    appearance: 'light',
    radius: 0.6,
  },
] as const;

interface ThemeChoice {
  name: string;
  primary: string;
  variant: 'tint' | 'vibrant' | 'professional';
  appearance: 'dark' | 'light';
  radius: number;
}

function applyTheme(theme: ThemeChoice) {
  // Guardar tema en localStorage
  localStorage.setItem('theme', JSON.stringify(theme));
  
  // Aplicar tema directamente
  const themeFile = {
    primary: theme.primary,
    variant: theme.variant,
    appearance: theme.appearance,
    radius: theme.radius,
  };
  
  // Simular la aplicación del tema actualizando theme.json
  // (En una aplicación real, esto se manejaría mediante un endpoint o config)
  fetch('/api/theme', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(themeFile),
  }).catch(() => {
    // Si la API falla (como en nuestro caso), aplicamos los cambios directamente al DOM
    document.documentElement.style.setProperty('--primary', theme.primary);
    
    // Cambiar entre temas claros y oscuros
    if (theme.appearance === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  });
  
  // Disparar un evento personalizado para notificar cambios de tema
  window.dispatchEvent(new CustomEvent('theme-change', { detail: theme }));
}

export function ThemeSelector() {
  const [currentTheme, setCurrentTheme] = useState<ThemeChoice>(THEMES[0]);
  const [appearance, setAppearance] = useState<'dark' | 'light'>(THEMES[0].appearance);
  
  // Cargar tema guardado al iniciar
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      try {
        const parsedTheme = JSON.parse(savedTheme) as ThemeChoice;
        setCurrentTheme(parsedTheme);
        setAppearance(parsedTheme.appearance);
      } catch (error) {
        console.error('Error parsing saved theme:', error);
      }
    }
  }, []);
  
  // Aplicar cambios de tema
  const changeTheme = (theme: ThemeChoice) => {
    // Combinar con la apariencia actual
    const newTheme = { ...theme, appearance };
    setCurrentTheme(newTheme);
    applyTheme(newTheme);
  };
  
  // Cambiar entre claro y oscuro
  const changeAppearance = (mode: 'dark' | 'light') => {
    setAppearance(mode);
    const newTheme = { ...currentTheme, appearance: mode };
    setCurrentTheme(newTheme);
    applyTheme(newTheme);
  };
  
  // Aplicamos estilos mejorados para garantizar visibilidad
  // sin necesidad de verificadores de contraste complejos

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className="h-10 w-10 rounded-full bg-primary bg-opacity-10 hover:bg-opacity-20 transition-all duration-200 border-primary border-opacity-30"
          style={{ 
            boxShadow: `0 0 10px ${currentTheme.primary}`,
            transform: 'scale(0.95)',
          }}
        >
          <Palette className="h-5 w-5 text-primary" style={{ filter: 'drop-shadow(0 0 2px rgba(255, 255, 255, 0.5))' }} />
          <span className="sr-only">Cambiar tema</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4 border border-primary border-opacity-30" align="end" sideOffset={8}>
        <div className="space-y-5">
          <div className="text-center mb-2">
            <h3 className="text-lg font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Personaliza tu experiencia</h3>
            <p className="text-xs text-muted-foreground mt-1">Elige el tema que mejor se adapte a tu estilo</p>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Apariencia</h4>
            <Tabs 
              defaultValue={appearance} 
              value={appearance}
              onValueChange={(value) => changeAppearance(value as 'dark' | 'light')}
              className="w-full"
            >
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="dark">Oscuro</TabsTrigger>
                <TabsTrigger value="light">Claro</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Color de acento</h4>
            <div className="grid grid-cols-4 gap-2 max-h-[240px] overflow-y-auto p-1">
              {THEMES.filter(theme => theme.appearance === appearance).map((theme) => {
                const isActive = currentTheme.primary === theme.primary;
                const colorName = theme.name.split(' ')[0];
                
                return (
                  <button
                    key={theme.name}
                    className={`flex flex-col items-center justify-center rounded-md p-2 border ${
                      isActive ? 'border-primary shadow-md' : 'border-transparent'
                    } hover:border-primary hover:shadow-sm transition-all duration-200 transform ${
                      isActive ? 'scale-105' : 'hover:scale-102'
                    } focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50`}
                    onClick={() => changeTheme(theme)}
                    title={theme.name}
                  >
                    <span
                      className={`flex h-7 w-7 shrink-0 rounded-full items-center justify-center ${isActive ? 'ring-2 ring-opacity-50 ring-white' : ''}`}
                      style={{ 
                        backgroundColor: theme.primary,
                        boxShadow: `0 0 8px ${theme.primary}`,
                        border: '1px solid rgba(255, 255, 255, 0.3)'
                      }}
                    >
                      {isActive && <Check className="h-3 w-3 text-white drop-shadow-md" />}
                    </span>
                    <span className="mt-1 text-xs font-medium drop-shadow-sm">{colorName}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}