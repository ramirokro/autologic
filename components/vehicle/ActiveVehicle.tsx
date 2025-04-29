import { useVehicle } from '@/hooks/use-vehicle';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CarIcon, XIcon } from 'lucide-react';

interface ActiveVehicleProps {
  productCount?: number;
}

export default function ActiveVehicle({ productCount }: ActiveVehicleProps) {
  const { selectedVehicle, clearVehicle } = useVehicle();
  
  if (!selectedVehicle) return null;
  
  const formatVehicle = () => {
    const { year, make, model, engine } = selectedVehicle;
    let formatted = `${year} ${make} ${model}`;
    if (engine) formatted += ` • ${engine}`;
    return formatted;
  };
  
  return (
    <Card className="bg-neutral-100 border border-neutral-200 mb-6">
      <CardContent className="p-3">
        <div className="flex items-center justify-between flex-wrap">
          <div>
            <h3 className="font-medium text-secondary">Vehículo seleccionado:</h3>
            <div className="flex items-center mt-1 text-sm bg-white rounded-md px-3 py-1.5 border border-neutral-300 inline-block">
              <CarIcon className="text-primary mr-2 h-4 w-4" />
              <span>{formatVehicle()}</span>
              <Button 
                variant="ghost" 
                size="icon" 
                className="ml-2 text-neutral-500 hover:text-red-500 h-4 w-4 p-0"
                onClick={clearVehicle}
              >
                <XIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {productCount !== undefined && (
            <div className="mt-2 md:mt-0">
              <span className="text-secondary text-sm mr-2">
                {productCount} productos compatibles encontrados
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
