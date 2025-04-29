import React, { useState, useEffect } from 'react';
import { Link, useLocation, useRoute } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, AlertTriangle, Clock, Share2, ShoppingCart, Terminal, Cpu, Database, ShieldAlert, Loader2 } from 'lucide-react';
import { useVehicle } from '@/hooks/use-vehicle';
import { buscarProductosPorRefaccion, Producto } from '@/lib/shopify';

export default function DiagnosticDetails() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute('/diagnostics/details/:id');
  const diagnosticId = params?.id;
  const { selectedVehicle } = useVehicle();
  
  // Estado para los productos de Shopify
  const [shopifyProductos, setShopifyProductos] = useState<Producto[]>([]);
  const [isLoadingProductos, setIsLoadingProductos] = useState(false);
  
  // En un caso real, cargaríamos los datos mediante una API request
  // usando el diagnosticId para obtener los detalles específicos
  // Aquí simulamos los datos
  const diagnosticDetails = {
    id: diagnosticId || '1',
    date: '10 abril, 2025',
    title: 'Fallo sensor de oxígeno',
    severity: 'media',
    code: 'P0136',
    description: 'Sensor de oxígeno (O2) Circuito 1 Sensor 2',
    diagnosis: 'Se ha detectado una falla en el sensor de oxígeno (O2) del banco 1 sensor 2. Este sensor monitorea la cantidad de oxígeno en los gases de escape después del catalizador y es crucial para el funcionamiento óptimo del sistema de emisiones y eficiencia de combustible.',
    recommendations: 'Te recomendamos revisar el sensor de oxígeno y reemplazarlo si es necesario. Un sensor defectuoso puede afectar el rendimiento del motor y las emisiones.',
    severity_explanation: 'Nivel de urgencia medio. Puedes seguir conduciendo pero es recomendable realizar la reparación pronto para evitar daños mayores y aumento en el consumo de combustible.',
    recommededParts: [
      {
        id: '1',
        name: 'Sensor O2 para Nissan Versa',
        compatibility: '2016-2021',
        price: 580.00,
        image: 'https://m.media-amazon.com/images/I/61tEbz0H9aL._AC_SL1500_.jpg'
      },
      {
        id: '2',
        name: 'Conector para sensor de oxígeno',
        compatibility: 'Universal',
        price: 120.00,
        image: 'https://m.media-amazon.com/images/I/61rq6FLuv+L._AC_SL1000_.jpg'
      }
    ]
  };
  
  // Efecto para cargar productos de Shopify basados en el código OBD
  useEffect(() => {
    // Si tenemos un vehículo seleccionado y un código de diagnóstico, buscamos productos
    const cargarProductosShopify = async () => {
      if (!selectedVehicle || !diagnosticDetails.code) return;
      
      try {
        setIsLoadingProductos(true);
        
        // Buscar productos relacionados con sensor de oxígeno
        // En un caso real, usaríamos refacciones específicas del código OBD
        const refaccion = diagnosticDetails.title.includes('oxígeno') 
          ? 'Sensor de oxígeno' 
          : diagnosticDetails.title;
          
        const productos = await buscarProductosPorRefaccion(
          refaccion,
          selectedVehicle.make,
          selectedVehicle.model,
          selectedVehicle.year
        );
        
        setShopifyProductos(productos);
      } catch (error) {
        console.error('Error al cargar productos de Shopify:', error);
      } finally {
        setIsLoadingProductos(false);
      }
    };
    
    cargarProductosShopify();
  }, [selectedVehicle, diagnosticDetails.code, diagnosticDetails.title]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'alta':
        return 'text-red-500';
      case 'media':
        return 'text-amber-400';
      case 'baja':
        return 'text-green-400';
      default:
        return 'text-amber-400';
    }
  };
  
  const getTerminalSeverityBg = (severity: string) => {
    switch (severity) {
      case 'alta':
        return 'bg-red-900/20 border-red-800/30';
      case 'media':
        return 'bg-amber-900/20 border-amber-800/30';
      case 'baja':
        return 'bg-green-900/20 border-green-800/30';
      default:
        return 'bg-amber-900/20 border-amber-800/30';
    }
  };

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'alta':
        return 'CRÍTICO';
      case 'media':
        return 'MODERADO';
      case 'baja':
        return 'LEVE';
      default:
        return 'MODERADO';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-800 p-4 bg-black flex items-center justify-between">
        <div className="flex items-center">
          <div className="relative w-10 h-10 bg-zinc-800 rounded-md flex items-center justify-center mr-4 border border-zinc-700">
            <Terminal className="h-5 w-5 text-amber-400" />
            <div className="absolute top-0 right-0 w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
          </div>
          <div className="font-mono uppercase tracking-wide text-zinc-300">
            <span className="text-amber-500 font-bold">AUTOLOGIC</span>
            <span className="ml-2 text-xs bg-zinc-800 px-1.5 py-0.5 rounded text-amber-400">DIAGNÓSTICO</span>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-100"
          onClick={() => setLocation('/diagnostics/history')}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
      </header>

      {/* Content */}
      <main className="flex-1 p-6">
        <div className="w-full max-w-3xl mx-auto">
          {/* Terminal container */}
          <div className="bg-black border border-zinc-800 rounded-md p-4 font-mono text-sm mb-4">
            {/* Terminal header */}
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center">
                <Database className="h-4 w-4 text-amber-400 mr-2" />
                <span className="text-xs uppercase text-amber-400">REPORTE DE DIAGNÓSTICO</span>
              </div>
              <div className="flex space-x-1">
                <div className="w-3 h-3 rounded-full bg-zinc-700"></div>
                <div className="w-3 h-3 rounded-full bg-zinc-700"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500 animate-pulse"></div>
              </div>
            </div>
            
            {/* Terminal content */}
            <div className="border border-zinc-800 rounded-md overflow-hidden">
              <div className="bg-zinc-900 px-3 py-2 text-xs border-b border-zinc-800 flex justify-between">
                <span>Diagnóstico #{diagnosticDetails.id}</span>
                <span className="text-zinc-500 font-mono text-xs">{diagnosticDetails.date}</span>
              </div>
              
              <div className="p-4 bg-black">
                {/* Encabezado */}
                <div className="mb-4 pb-3 border-b border-zinc-800">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center">
                      <AlertTriangle className={`h-4 w-4 mr-2 ${getSeverityColor(diagnosticDetails.severity)}`} />
                      <h2 className={`font-bold ${getSeverityColor(diagnosticDetails.severity)}`}>
                        {diagnosticDetails.title.toUpperCase()}
                      </h2>
                    </div>
                    <div className={`px-2 py-0.5 border rounded-sm text-xs font-bold ${getSeverityColor(diagnosticDetails.severity)} ${getTerminalSeverityBg(diagnosticDetails.severity)}`}>
                      {getSeverityLabel(diagnosticDetails.severity)}
                    </div>
                  </div>
                </div>
                
                {/* Contenido del diagnóstico */}
                <div className="space-y-5">
                  <div className="p-2 bg-zinc-900 border border-zinc-800 rounded-md">
                    <div className="flex items-center mb-2">
                      <span className="text-zinc-500 font-mono text-xs mr-2">[DTC]</span>
                      <span className={`font-mono font-bold text-base ${getSeverityColor(diagnosticDetails.severity)}`}>
                        {diagnosticDetails.code}
                      </span>
                    </div>
                    <div className="text-xs text-zinc-400 ml-8">
                      {diagnosticDetails.description}
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center mb-2">
                      <span className="text-zinc-500 font-mono text-xs mr-2">$ cat</span>
                      <span className="text-amber-400 font-bold">/diagnóstico.txt</span>
                    </div>
                    <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-md text-zinc-300 text-xs">
                      {diagnosticDetails.diagnosis}
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center mb-2">
                      <span className="text-zinc-500 font-mono text-xs mr-2">$ cat</span>
                      <span className="text-green-400 font-bold">/recomendaciones.txt</span>
                    </div>
                    <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-md text-zinc-300 text-xs">
                      {diagnosticDetails.recommendations}
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center mb-2">
                      <span className="text-zinc-500 font-mono text-xs mr-2">$ cat</span>
                      <span className={`font-bold ${getSeverityColor(diagnosticDetails.severity)}`}>/nivel_urgencia.txt</span>
                    </div>
                    <div className={`p-3 bg-zinc-900 border rounded-md text-zinc-300 text-xs ${getTerminalSeverityBg(diagnosticDetails.severity)}`}>
                      {diagnosticDetails.severity_explanation}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Refacciones recomendadas locales */}
          <div className="bg-black border border-zinc-800 rounded-md p-4 font-mono text-sm mb-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center">
                <ShoppingCart className="h-4 w-4 text-green-400 mr-2" />
                <span className="text-xs uppercase text-green-400">REFACCIONES RECOMENDADAS</span>
              </div>
            </div>
            
            <div className="space-y-4">
              {diagnosticDetails.recommededParts.map((part, index) => (
                <div key={part.id} className="border border-zinc-800 rounded-md overflow-hidden">
                  <div className="p-2 bg-zinc-900 border-b border-zinc-800 flex items-center">
                    <span className="text-zinc-500 font-mono text-xs mr-2">[{String(index + 1).padStart(2, '0')}]</span>
                    <span className="font-bold text-green-400">{part.name}</span>
                  </div>
                  
                  <div className="p-3 bg-black flex">
                    <div className="w-20 h-20 flex-shrink-0 bg-zinc-900 border border-zinc-800 rounded-md overflow-hidden mr-4">
                      {part.image ? (
                        <img 
                          src={part.image} 
                          alt={part.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-500">
                          <span>Sin imagen</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-zinc-400 mb-2">
                        Compatibilidad: <span className="text-zinc-300">{part.compatibility}</span>
                      </p>
                      <div className="flex items-center justify-between mt-4">
                        <span className="font-bold text-xs bg-zinc-900 px-2 py-1 rounded border border-zinc-800">
                          $ <span className="text-green-400">{part.price.toFixed(2)}</span>
                        </span>
                        <Button 
                          size="sm" 
                          className="h-8 bg-green-600 hover:bg-green-700 text-black rounded-sm"
                        >
                          <ShoppingCart className="h-3 w-3 mr-1" />
                          Agregar al carrito
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Productos de la tienda Shopify */}
          <div className="bg-black border border-zinc-800 rounded-md p-4 font-mono text-sm mb-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center">
                <ShoppingCart className="h-4 w-4 text-amber-400 mr-2" />
                <span className="text-xs uppercase text-amber-400">PRODUCTOS EN TIENDA ONLINE</span>
              </div>
              <div className="flex space-x-1">
                <div className="w-3 h-3 rounded-full bg-zinc-700"></div>
                <div className="w-3 h-3 rounded-full bg-zinc-700"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500 animate-pulse"></div>
              </div>
            </div>
            
            {isLoadingProductos && (
              <div className="p-8 flex flex-col items-center justify-center">
                <Loader2 className="h-8 w-8 text-amber-500 animate-spin mb-2" />
                <p className="text-xs text-zinc-400">Buscando refacciones compatibles en la tienda...</p>
              </div>
            )}
            
            {!isLoadingProductos && shopifyProductos.length > 0 && (
              <div className="space-y-4">
                {shopifyProductos.map((producto, index) => (
                  <div key={producto.id} className="border border-zinc-800 rounded-md overflow-hidden">
                    <div className="p-2 bg-zinc-900 border-b border-zinc-800 flex items-center">
                      <span className="text-zinc-500 font-mono text-xs mr-2">[{String(index + 1).padStart(2, '0')}]</span>
                      <span className="font-bold text-amber-400">{producto.title}</span>
                    </div>
                    
                    <div className="p-3 bg-black flex">
                      <div className="w-20 h-20 flex-shrink-0 bg-zinc-900 border border-zinc-800 rounded-md overflow-hidden mr-4">
                        {producto.image ? (
                          <img 
                            src={producto.image} 
                            alt={producto.imageAlt || producto.title} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-500">
                            <span>Sin imagen</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-zinc-400 mb-2 line-clamp-2">
                          {producto.description}
                        </p>
                        <div className="flex items-center justify-between mt-4">
                          <span className="font-bold text-xs bg-zinc-900 px-2 py-1 rounded border border-zinc-800">
                            $ <span className="text-amber-400">{parseFloat(producto.price).toFixed(2)}</span>
                          </span>
                          <Button 
                            size="sm" 
                            className="h-8 bg-amber-500 hover:bg-amber-600 text-black rounded-sm"
                            onClick={() => window.open(`https://autologic.mx/products/${producto.handle}`, '_blank')}
                          >
                            <ShoppingCart className="h-3 w-3 mr-1" />
                            Ver en tienda
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {!isLoadingProductos && shopifyProductos.length === 0 && (
              <div className="p-8 flex flex-col items-center justify-center">
                <p className="text-xs text-zinc-400 mb-2">No se encontraron productos compatibles en la tienda.</p>
                <Button 
                  size="sm" 
                  className="bg-amber-600 hover:bg-amber-700 text-black rounded-sm"
                  onClick={() => window.open('https://autologic.mx', '_blank')}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Visitar tienda
                </Button>
              </div>
            )}
          </div>
          
          {/* Footer con estado del sistema */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-md p-3 font-mono text-xs">
            <div className="flex items-center mb-2 text-zinc-400">
              <ShieldAlert className="h-3 w-3 mr-1.5 text-green-400" />
              <span>ESTADO DEL SISTEMA</span>
            </div>
            <div className="space-y-1.5 pl-2">
              <div className="flex justify-between">
                <span className="text-zinc-500">Diagnóstico:</span>
                <span className="text-green-400">Completado</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Base de Datos:</span>
                <span className="text-green-400">Conectada</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Sistema:</span>
                <span className="text-green-400">En línea</span>
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex gap-2">
            <Button 
              className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 h-auto py-2 text-xs border border-zinc-700 rounded-sm" 
              asChild
            >
              <Link href="/diagnostics/history">VOLVER AL HISTORIAL</Link>
            </Button>
            <Button 
              className="flex-1 bg-green-600 hover:bg-green-700 text-black h-auto py-2 text-xs font-bold rounded-sm" 
              asChild
            >
              <Link href="/">FINALIZAR</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}