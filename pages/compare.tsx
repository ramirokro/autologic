import React from 'react';
import { ProductCompare } from '@/components/product/ProductCompare';
import VehicleSelector from '@/components/vehicle/VehicleSelector';

export default function ComparePage() {
  return (
    <div className="container mx-auto px-4 py-6">
      {/* Selector de vehículo para filtrar compatibilidad */}
      <VehicleSelector />
      
      {/* Título de la página */}
      <div className="mb-6 mt-8">
        <h1 className="text-2xl font-bold">Comparador de Productos</h1>
        <p className="text-muted-foreground mt-2">
          Compara hasta 4 productos lado a lado para encontrar la mejor opción para tu vehículo
        </p>
      </div>
      
      {/* Componente de comparación */}
      <ProductCompare />
    </div>
  );
}