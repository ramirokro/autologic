import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QrCode, Camera, FileUp, AlertCircle, Check, ScanLine } from 'lucide-react';

interface QRScannerProps {
  onCodeDetected: (code: string) => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onCodeDetected }) => {
  const [scannerStarted, setScannerStarted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = 'qr-reader';
  
  // Iniciar el escáner
  const startScanner = async () => {
    try {
      setError(null);
      setSuccess(null);
      
      // Crear instancia de HTML5QRCode
      scannerRef.current = new Html5Qrcode(scannerContainerId);
      
      await scannerRef.current.start(
        { facingMode: 'environment' }, // Usar cámara trasera
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        },
        (decodedText) => {
          // Función de éxito - código QR detectado
          handleScanSuccess(decodedText);
        },
        (errorMessage) => {
          // Error en tiempo real (ignorar, no es un error de funcionalidad)
          console.log(errorMessage);
        }
      );
      
      setScannerStarted(true);
    } catch (err) {
      setError('No se pudo acceder a la cámara. Verifica los permisos del navegador.');
      console.error('Error al iniciar el escáner:', err);
    }
  };
  
  // Detener el escáner
  const stopScanner = async () => {
    try {
      if (scannerRef.current && scannerStarted) {
        await scannerRef.current.stop();
        setScannerStarted(false);
      }
    } catch (err) {
      console.error('Error al detener el escáner:', err);
    }
  };
  
  // Manejar archivo seleccionado
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setSuccess(null);
    
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      
      try {
        // Crear instancia de HTML5QRCode si no existe
        if (!scannerRef.current) {
          scannerRef.current = new Html5Qrcode(scannerContainerId);
        }
        
        // Escanear imagen
        const decodedText = await scannerRef.current.scanFile(file, true);
        handleScanSuccess(decodedText);
      } catch (err) {
        setError('No se pudo detectar un código QR/OBD válido en la imagen.');
        console.error('Error al escanear el archivo:', err);
      }
    }
  };
  
  // Procesar código escaneado
  const handleScanSuccess = (decodedText: string) => {
    // Detener el escáner después de un escaneo exitoso
    stopScanner();
    
    // Verificar si es un código OBD-II válido (formato PXXXX, CXXXX, BXXXX, UXXX)
    const odbPattern = /^[PCBU][0-9][0-9A-F][0-9A-F][0-9A-F]$/i;
    
    // Extraer el código OBD del texto QR (asume que el QR puede contener más información)
    const odbMatch = decodedText.match(odbPattern);
    
    if (odbMatch) {
      const odbCode = odbMatch[0].toUpperCase();
      setSuccess(`Código OBD detectado: ${odbCode}`);
      onCodeDetected(odbCode);
    } else {
      // Si no es un código OBD válido
      setError('El código escaneado no es un código OBD-II válido.');
    }
  };
  
  // Limpiar al desmontar el componente
  useEffect(() => {
    return () => {
      if (scannerRef.current && scannerStarted) {
        scannerRef.current.stop().catch(error => {
          console.error('Error al detener el escáner durante la limpieza:', error);
        });
      }
    };
  }, [scannerStarted]);
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <QrCode className="mr-2 h-5 w-5 text-primary" />
          Escanear código QR
        </CardTitle>
        <CardDescription>
          Escanea un código QR que contenga el código OBD de tu vehículo
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="camera" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="camera" className="flex items-center gap-1">
              <Camera className="h-4 w-4" />
              Cámara
            </TabsTrigger>
            <TabsTrigger value="file" className="flex items-center gap-1">
              <FileUp className="h-4 w-4" />
              Archivo
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="camera" className="mt-4">
            <div className="flex flex-col items-center space-y-4">
              <div id={scannerContainerId} className="w-full max-w-[300px] h-[300px] bg-muted/20 rounded-md relative">
                {!scannerStarted && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <ScanLine className="h-16 w-16 text-primary/50 mb-2" />
                    <p className="text-sm text-muted-foreground">La cámara aparecerá aquí</p>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                {!scannerStarted ? (
                  <Button 
                    onClick={startScanner}
                    className="flex items-center gap-1"
                  >
                    <Camera className="h-4 w-4" />
                    Iniciar cámara
                  </Button>
                ) : (
                  <Button 
                    onClick={stopScanner}
                    variant="outline"
                    className="flex items-center gap-1"
                  >
                    Detener cámara
                  </Button>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="file" className="mt-4">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-full max-w-[300px] h-[200px] bg-muted/20 rounded-md flex flex-col items-center justify-center p-4">
                <FileUp className="h-12 w-12 text-primary/50 mb-2" />
                <p className="text-sm text-center text-muted-foreground mb-4">
                  Sube una imagen con un código QR que contenga un código OBD
                </p>
                
                <Button
                  variant="outline"
                  className="relative"
                  size="sm"
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  Seleccionar imagen
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert className="mt-4 bg-primary/10 text-primary border-primary/20">
            <Check className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default QRScanner;