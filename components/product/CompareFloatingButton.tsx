import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { SplitSquareVertical } from 'lucide-react';
import { useLocation } from 'wouter';

// Evento personalizado para actualización de productos en comparación
export const COMPARE_PRODUCTS_UPDATED = 'compare-products-updated';

export function CompareFloatingButton() {
  const [compareCount, setCompareCount] = useState(0);
  const [, navigate] = useLocation();

  // Verificar cuántos productos hay en la comparación
  useEffect(() => {
    const checkCompareProducts = () => {
      const savedIds = localStorage.getItem('compareProducts');
      if (savedIds) {
        try {
          const ids = JSON.parse(savedIds) as number[];
          setCompareCount(ids.length);
        } catch (error) {
          console.error('Error al verificar productos para comparar:', error);
          setCompareCount(0);
        }
      } else {
        setCompareCount(0);
      }
    };

    // Verificar al inicio
    checkCompareProducts();

    // Actualizar cuando cambia el localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'compareProducts') {
        checkCompareProducts();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Crear un intervalo para verificar cambios (compatibilidad entre pestañas)
    // Escuchar evento personalizado
    const handleCustomEvent = () => {
      checkCompareProducts();
    };
    
    window.addEventListener(COMPARE_PRODUCTS_UPDATED, handleCustomEvent);
    
    // El intervalo solo es necesario para verificar cambios desde otras pestañas
    const interval = setInterval(checkCompareProducts, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener(COMPARE_PRODUCTS_UPDATED, handleCustomEvent);
      clearInterval(interval);
    };
  }, []);

  // Si no hay productos en comparación, no mostrar el botón
  if (compareCount === 0) {
    return null;
  }

  return (
    <Button
      onClick={() => navigate('/compare')}
      className="fixed bottom-6 right-6 z-50 shadow-lg"
      size="lg"
    >
      <SplitSquareVertical className="mr-2 h-5 w-5" />
      Comparar <span className="ml-1 font-bold">{compareCount}</span> productos
    </Button>
  );
}