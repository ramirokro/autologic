import { useState, useEffect } from 'react';
import { useVehicle } from '@/hooks/use-vehicle';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { IVehicle } from '@/lib/types';
import { CarIcon, SearchIcon, BookmarkIcon } from 'lucide-react';
import { useLocation } from 'wouter';

export default function VehicleSelector() {
  const {
    vehicleFilter,
    years,
    makes,
    models,
    engines,
    updateFilter,
    fetchFilterOptions,
    saveVehicle,
    isSaved,
    toggleSaved,
    searchVehicleProducts,
  } = useVehicle();
  
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Logging para depuración
  useEffect(() => {
    console.log("Estado actual del filtro:", vehicleFilter);
    console.log("Años disponibles:", years);
  }, [vehicleFilter, years]);

  // Effects for cascading selects
  useEffect(() => {
    if (vehicleFilter.year) {
      console.log("Filtrando marcas para el año:", vehicleFilter.year);
      fetchFilterOptions({ year: vehicleFilter.year }, 'make');
    }
  }, [vehicleFilter.year]);
  
  useEffect(() => {
    if (vehicleFilter.year && vehicleFilter.make) {
      fetchFilterOptions({ year: vehicleFilter.year, make: vehicleFilter.make }, 'model');
    }
  }, [vehicleFilter.make]);
  
  useEffect(() => {
    if (vehicleFilter.year && vehicleFilter.make && vehicleFilter.model) {
      fetchFilterOptions({ 
        year: vehicleFilter.year, 
        make: vehicleFilter.make, 
        model: vehicleFilter.model 
      }, 'engine');
    }
  }, [vehicleFilter.model]);
  
  const handleSearch = async () => {
    if (!vehicleFilter.year || !vehicleFilter.make || !vehicleFilter.model) {
      toast({
        title: "Selección incompleta",
        description: "Por favor selecciona al menos año, marca y modelo del vehículo.",
        variant: "destructive",
      });
      return;
    }
    
    // Create a vehicle object from the filter
    const vehicle: IVehicle = {
      year: vehicleFilter.year,
      make: vehicleFilter.make,
      model: vehicleFilter.model,
      engine: vehicleFilter.engine,
    };
    
    // Save the vehicle
    saveVehicle(vehicle);
    
    // Navigate to catalog with filters
    const queryString = await searchVehicleProducts();
    if (queryString) {
      setLocation(queryString);
    }
  };
  
  return (
    <div className="bg-[#2C3E50] py-6 sticky top-0 z-10">
      <div className="container mx-auto px-4">
        <Card>
          <CardContent className="p-4">
            <h2 className="text-lg font-semibold mb-3 flex items-center">
              <CarIcon className="mr-2 h-5 w-5 text-primary" />
              Buscar por vehículo
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {/* Year Selector */}
              <div>
                <Label className="block text-sm font-medium text-neutral-700 mb-1">Año</Label>
                <Select
                  value={vehicleFilter.year?.toString() || ""}
                  onValueChange={(value) => updateFilter({ year: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar año" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Make Selector */}
              <div>
                <Label className="block text-sm font-medium text-neutral-700 mb-1">Marca</Label>
                <Select
                  value={vehicleFilter.make || ""}
                  onValueChange={(value) => updateFilter({ make: value })}
                  disabled={!vehicleFilter.year}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar marca" />
                  </SelectTrigger>
                  <SelectContent>
                    {makes.map((make) => (
                      <SelectItem key={make} value={make}>
                        {make}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Model Selector */}
              <div>
                <Label className="block text-sm font-medium text-neutral-700 mb-1">Modelo</Label>
                <Select
                  value={vehicleFilter.model || ""}
                  onValueChange={(value) => updateFilter({ model: value })}
                  disabled={!vehicleFilter.make}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar modelo" />
                  </SelectTrigger>
                  <SelectContent>
                    {models.map((model) => (
                      <SelectItem key={model} value={model}>
                        {model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Engine Selector */}
              <div>
                <Label className="block text-sm font-medium text-neutral-700 mb-1">Motor</Label>
                <Select
                  value={vehicleFilter.engine || ""}
                  onValueChange={(value) => updateFilter({ engine: value })}
                  disabled={!vehicleFilter.model}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar motor" />
                  </SelectTrigger>
                  <SelectContent>
                    {engines.map((engine) => (
                      <SelectItem key={engine} value={engine}>
                        {engine}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="mt-4 flex items-center justify-between">
              <Button 
                onClick={handleSearch}
                className="bg-primary hover:bg-primary/90 text-white"
              >
                <SearchIcon className="mr-2 h-4 w-4" />
                Buscar partes compatibles
              </Button>
              
              <Button 
                variant="ghost"
                onClick={toggleSaved}
                className={isSaved ? "text-primary" : "text-secondary hover:text-primary"}
              >
                {isSaved ? (
                  <BookmarkIcon className="mr-1 h-4 w-4 fill-primary text-primary" />
                ) : (
                  <BookmarkIcon className="mr-1 h-4 w-4" />
                )}
                <span>{isSaved ? 'Vehículo guardado' : 'Guardar vehículo'}</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
