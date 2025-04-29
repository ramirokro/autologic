import { useEffect } from 'react';

interface ThemeProps {
  primary: string;
  variant: 'tint' | 'vibrant' | 'professional';
  appearance: 'dark' | 'light';
  radius: number;
}

export function ThemeInitializer() {
  // Carga y aplica el tema guardado al iniciar la aplicación
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme) {
      try {
        const theme = JSON.parse(savedTheme) as ThemeProps;
        
        // Aplicar el tema directamente al DOM
        document.documentElement.style.setProperty('--primary', theme.primary);
        
        // Cambiar entre temas claros y oscuros
        if (theme.appearance === 'dark') {
          document.documentElement.classList.add('dark');
          document.documentElement.classList.remove('light');
        } else {
          document.documentElement.classList.add('light');
          document.documentElement.classList.remove('dark');
        }
      } catch (error) {
        console.error('Error loading theme:', error);
      }
    }
  }, []);

  // Este componente no renderiza ningún elemento visible
  return null;
}