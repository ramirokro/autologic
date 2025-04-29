import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';

const THEME_LIGHT = {
  primary: '#22C55E', // Verde (color del logo)
  variant: 'tint' as const,
  appearance: 'light' as const,
  radius: 0.6,
};

const THEME_DARK = {
  primary: '#22C55E', // Verde (color del logo)
  variant: 'tint' as const, 
  appearance: 'dark' as const,
  radius: 0.6,
};

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  
  // Cargar tema guardado al iniciar
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      try {
        const parsedTheme = JSON.parse(savedTheme);
        setIsDark(parsedTheme.appearance === 'dark');
      } catch (error) {
        console.error('Error parsing saved theme:', error);
      }
    } else {
      // Por defecto, usar preferencia del sistema
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDark(prefersDark);
      applyTheme(prefersDark ? THEME_DARK : THEME_LIGHT);
    }
  }, []);
  
  // Cambiar entre claro y oscuro
  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    applyTheme(newIsDark ? THEME_DARK : THEME_LIGHT);
  };
  
  return (
    <Button 
      variant="outline" 
      size="icon" 
      onClick={toggleTheme}
      aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
    >
      {isDark ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </Button>
  );
}

function applyTheme(theme: typeof THEME_DARK | typeof THEME_LIGHT) {
  // Guardar tema en localStorage
  localStorage.setItem('theme', JSON.stringify(theme));
  
  // Aplicar tema directamente
  // Cambiar entre temas claros y oscuros
  if (theme.appearance === 'dark') {
    document.documentElement.classList.add('dark');
    document.documentElement.classList.remove('light');
  } else {
    document.documentElement.classList.add('light');
    document.documentElement.classList.remove('dark');
  }
  
  // Disparar un evento personalizado para notificar cambios de tema
  window.dispatchEvent(new CustomEvent('theme-change', { detail: theme }));
}