import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { IImportOptions } from '@/lib/types';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { UploadIcon } from 'lucide-react';

interface ImportDataProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ImportData({ open, onOpenChange }: ImportDataProps) {
  const [importOptions, setImportOptions] = useState<IImportOptions>({
    type: 'compatibility',
    format: 'csv',
    updateExisting: true,
    deleteExisting: false,
    validateAces: true,
    sendNotification: false,
  });
  
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
  };
  
  const handleImport = async () => {
    if (!file) {
      toast({
        title: "Error",
        description: "Por favor selecciona un archivo para importar.",
        variant: "destructive",
      });
      return;
    }
    
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('options', JSON.stringify(importOptions));
      
      const response = await fetch('/api/import', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Error al importar datos');
      }
      
      const result = await response.json();
      
      toast({
        title: "Importación exitosa",
        description: `Se importaron ${result.imported} registros correctamente.`,
      });
      
      // Invalidate related queries
      if (importOptions.type === 'products') {
        queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['/api/compatibility'] });
        queryClient.invalidateQueries({ queryKey: ['/api/vehicles'] });
        queryClient.invalidateQueries({ queryKey: ['/api/products/compatible'] });
      }
      
      // Close modal
      onOpenChange(false);
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Error en la importación",
        description: error instanceof Error ? error.message : "Error desconocido al importar datos.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Importar datos ACES/PIES</DialogTitle>
          <DialogDescription>
            Importa datos de productos o compatibilidad vehicular desde archivos CSV o XML.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-6">
          {/* Import Type */}
          <div>
            <h4 className="font-medium text-lg mb-2">Seleccionar tipo de importación</h4>
            <div className="bg-neutral-50 p-4 rounded-md">
              <RadioGroup 
                value={importOptions.type} 
                onValueChange={(value) => setImportOptions({ ...importOptions, type: value as 'products' | 'compatibility' })}
              >
                <div className="flex items-start space-x-3 mb-4">
                  <RadioGroupItem value="products" id="import-products" />
                  <div>
                    <Label htmlFor="import-products" className="font-medium block">Productos (PIES)</Label>
                    <p className="text-sm text-neutral-600">
                      Importar datos básicos de productos: SKU, título, descripción, precio, inventario, etc.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <RadioGroupItem value="compatibility" id="import-fitment" />
                  <div>
                    <Label htmlFor="import-fitment" className="font-medium block">Compatibilidad vehicular (ACES)</Label>
                    <p className="text-sm text-neutral-600">
                      Importar relaciones entre productos y vehículos (Año/Marca/Modelo/Motor).
                    </p>
                  </div>
                </div>
              </RadioGroup>
            </div>
          </div>
          
          {/* File Format */}
          <div>
            <h4 className="font-medium text-lg mb-2">Formato de archivo</h4>
            <div className="bg-neutral-50 p-4 rounded-md">
              <RadioGroup 
                value={importOptions.format} 
                onValueChange={(value) => setImportOptions({ ...importOptions, format: value as 'csv' | 'xml' })}
              >
                <div className="flex items-start space-x-3 mb-4">
                  <RadioGroupItem value="csv" id="format-csv" />
                  <div>
                    <Label htmlFor="format-csv" className="font-medium block">CSV</Label>
                    <p className="text-sm text-neutral-600">
                      Archivo de valores separados por comas. Recomendado para importaciones simples.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <RadioGroupItem value="xml" id="format-xml" />
                  <div>
                    <Label htmlFor="format-xml" className="font-medium block">XML (ACES/PIES)</Label>
                    <p className="text-sm text-neutral-600">
                      Formato estándar de la industria para intercambio de datos de autopartes.
                    </p>
                  </div>
                </div>
              </RadioGroup>
            </div>
          </div>
          
          {/* Upload File */}
          <div>
            <h4 className="font-medium text-lg mb-2">Subir archivo</h4>
            <div className="border-2 border-dashed border-neutral-300 rounded-md p-6 text-center">
              <div className="mb-3">
                <UploadIcon className="h-12 w-12 text-neutral-400 mx-auto" />
              </div>
              <p className="text-neutral-600 mb-2">
                {file ? `Archivo seleccionado: ${file.name}` : 'Arrastra tu archivo aquí o haz clic para seleccionarlo'}
              </p>
              <p className="text-sm text-neutral-500 mb-3">Tamaño máximo: 50MB</p>
              <div className="relative">
                <input
                  type="file"
                  accept={importOptions.format === 'csv' ? '.csv' : '.xml'}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handleFileChange}
                />
                <Button variant="secondary">
                  Seleccionar archivo
                </Button>
              </div>
            </div>
          </div>
          
          {/* Import Options */}
          <div>
            <h4 className="font-medium text-lg mb-2">Opciones de importación</h4>
            <div className="space-y-3">
              <div className="flex items-center">
                <Checkbox 
                  id="update-existing" 
                  checked={importOptions.updateExisting}
                  onCheckedChange={(checked) => 
                    setImportOptions({ ...importOptions, updateExisting: checked as boolean })
                  }
                />
                <Label htmlFor="update-existing" className="ml-2">Actualizar productos existentes</Label>
              </div>
              <div className="flex items-center">
                <Checkbox 
                  id="delete-existing" 
                  checked={importOptions.deleteExisting}
                  onCheckedChange={(checked) => 
                    setImportOptions({ ...importOptions, deleteExisting: checked as boolean })
                  }
                />
                <Label htmlFor="delete-existing" className="ml-2">Eliminar compatibilidades anteriores</Label>
              </div>
              <div className="flex items-center">
                <Checkbox 
                  id="validate-aces" 
                  checked={importOptions.validateAces}
                  onCheckedChange={(checked) => 
                    setImportOptions({ ...importOptions, validateAces: checked as boolean })
                  }
                />
                <Label htmlFor="validate-aces" className="ml-2">Importar solo vehículos validados por ACES</Label>
              </div>
              <div className="flex items-center">
                <Checkbox 
                  id="send-notification" 
                  checked={importOptions.sendNotification}
                  onCheckedChange={(checked) => 
                    setImportOptions({ ...importOptions, sendNotification: checked as boolean })
                  }
                />
                <Label htmlFor="send-notification" className="ml-2">Enviar notificación al completar</Label>
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter className="flex justify-end space-x-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleImport}
            className="bg-primary hover:bg-primary/90 text-white"
            disabled={isUploading || !file}
          >
            {isUploading ? "Importando..." : "Iniciar importación"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
