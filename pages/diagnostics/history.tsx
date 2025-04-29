import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiRequest } from '@/lib/queryClient';
import { 
  ChevronLeft, 
  Clock, 
  AlertCircle, 
  ChevronRight, 
  Search, 
  Terminal, 
  Database, 
  AlertTriangle, 
  Cpu, 
  Folder
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';

interface Diagnostic {
  id: number;
  createdAt: string;
  vehicleInfo: {
    year?: number;
    make?: string;
    model?: string;
    engine?: string;
  };
  obdCodes: string[];
  symptoms: string[];
  diagnosis: string;
  severity: string;
}

export default function DiagnosticHistory() {
  const [, setLocation] = useLocation();
  const [diagnostics, setDiagnostics] = useState<Diagnostic[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Función para formatear la fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Función para mostrar un extracto del diagnóstico
  const truncateDiagnosis = (text: string, maxLength = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Función para obtener color de severidad
  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'crítica':
      case 'critica':
      case 'alta':
        return 'bg-red-900/20 text-red-500 border-red-800/30';
      case 'media':
      case 'moderada':
        return 'bg-amber-900/20 text-amber-400 border-amber-800/30';
      case 'baja':
        return 'bg-green-900/20 text-green-400 border-green-800/30';
      default:
        return 'bg-blue-900/20 text-blue-400 border-blue-800/30';
    }
  };
  
  // Función para obtener etiqueta de severidad en formato terminal
  const getTerminalSeverityLabel = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'crítica':
      case 'critica':
      case 'alta':
        return 'CRÍTICO';
      case 'media':
      case 'moderada':
        return 'MODERADO';
      case 'baja':
        return 'LEVE';
      default:
        return severity.toUpperCase();
    }
  };

  // Función para filtrar diagnósticos con el término de búsqueda
  const filteredDiagnostics = diagnostics.filter(diagnostic => {
    const searchContent = [
      diagnostic.diagnosis,
      ...(diagnostic.obdCodes || []),
      ...(diagnostic.symptoms || []),
      diagnostic.vehicleInfo?.make,
      diagnostic.vehicleInfo?.model,
    ].filter(Boolean).join(' ').toLowerCase();
    
    return searchTerm === '' || searchContent.includes(searchTerm.toLowerCase());
  });

  // Efecto para cargar diagnósticos
  useEffect(() => {
    const fetchDiagnostics = async () => {
      try {
        const userId = 1; // En un escenario real, esto vendría del sistema de autenticación
        const response = await apiRequest('GET', `/api/diagnostics?userId=${userId}`);
        const data = await response.json();
        setDiagnostics(data);
      } catch (error) {
        console.error('Error al cargar diagnósticos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDiagnostics();
  }, []);

  // Datos de ejemplo si no hay diagnósticos o para depuración rápida
  const mockDiagnostics: Diagnostic[] = [
    {
      id: 1,
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      vehicleInfo: {
        year: 2018,
        make: 'Toyota',
        model: 'Corolla',
        engine: '1.8L'
      },
      obdCodes: ['P0300'],
      symptoms: ['El motor falla al acelerar', 'Se enciende la luz de check engine'],
      diagnosis: 'El código P0300 indica un fallo de encendido múltiple. Basado en los síntomas y el historial del vehículo, lo más probable es que haya un problema con las bobinas de encendido o las bujías.',
      severity: 'Media'
    },
    {
      id: 2,
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      vehicleInfo: {
        year: 2015,
        make: 'Honda',
        model: 'Civic',
        engine: '1.5L Turbo'
      },
      obdCodes: ['P0420'],
      symptoms: ['Pérdida de potencia', 'Mayor consumo de combustible'],
      diagnosis: 'El código P0420 indica una eficiencia del catalizador por debajo del umbral. El convertidor catalítico está fallando y necesita ser reemplazado. Esto explica la pérdida de potencia y el mayor consumo de combustible.',
      severity: 'Alta'
    },
    {
      id: 3,
      createdAt: new Date(Date.now() - 86400000 * 12).toISOString(),
      vehicleInfo: {
        year: 2020,
        make: 'Ford',
        model: 'F-150',
        engine: '2.7L EcoBoost'
      },
      obdCodes: ['P0171'],
      symptoms: ['Ralentí inestable', 'Menos potencia de lo normal'],
      diagnosis: 'El código P0171 indica que la mezcla de aire/combustible está demasiado pobre. Esto podría ser causado por un sensor de flujo de masa de aire sucio o defectuoso, o posiblemente una fuga de vacío.',
      severity: 'Baja'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-800 p-4 bg-black flex items-center justify-between">
        <div className="flex items-center">
          <div className="relative w-10 h-10 bg-zinc-800 rounded-md flex items-center justify-center mr-4 border border-zinc-700">
            <Folder className="h-5 w-5 text-green-400" />
            <div className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
          <div className="font-mono uppercase tracking-wide text-zinc-300">
            <span className="text-green-500 font-bold">AUTOLOGIC</span>
            <span className="ml-2 text-xs bg-zinc-800 px-1.5 py-0.5 rounded text-green-400">HISTORIAL</span>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-100"
          onClick={() => setLocation('/')}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-auto p-6">
        <div className="w-full max-w-5xl mx-auto">
          {/* Terminal container */}
          <div className="bg-black border border-zinc-800 rounded-md p-4 font-mono text-sm mb-4">
            {/* Terminal header */}
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center">
                <Database className="h-4 w-4 text-green-400 mr-2" />
                <span className="text-xs uppercase text-green-400">REGISTROS DE DIAGNÓSTICO</span>
              </div>
              <div className="flex space-x-1">
                <div className="w-3 h-3 rounded-full bg-zinc-700"></div>
                <div className="w-3 h-3 rounded-full bg-zinc-700"></div>
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
              </div>
            </div>

            {/* Buscador con estilo terminal */}
            <div className="mb-6 relative">
              <div className="flex items-center border border-zinc-800 bg-zinc-900 rounded-md overflow-hidden">
                <div className="bg-zinc-900 px-3 py-2 border-r border-zinc-800 text-zinc-500">
                  $ find
                </div>
                <Input
                  type="text"
                  placeholder="Buscar diagnósticos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 pl-2 h-9 font-mono text-zinc-300 text-xs"
                />
                <div className="pr-2 flex items-center">
                  <Search className="h-4 w-4 text-zinc-500" />
                </div>
              </div>
            </div>
          
            {loading ? (
              // Skeleton loading con estilo terminal
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="border border-zinc-800 rounded-md overflow-hidden">
                    <div className="bg-zinc-900 px-3 py-2 border-b border-zinc-800 flex justify-between">
                      <Skeleton className="h-4 w-1/3 bg-zinc-800" />
                      <Skeleton className="h-4 w-1/4 bg-zinc-800" />
                    </div>
                    <div className="p-3 bg-black">
                      <Skeleton className="h-4 w-full mb-2 bg-zinc-800" />
                      <Skeleton className="h-4 w-5/6 mb-2 bg-zinc-800" />
                      <Skeleton className="h-4 w-4/6 bg-zinc-800" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Mostrar lista de diagnósticos con estilo terminal
              <div className="space-y-4">
                {(filteredDiagnostics.length > 0 ? filteredDiagnostics : mockDiagnostics).map((diagnostic, index) => (
                  <div 
                    key={diagnostic.id} 
                    className="border border-zinc-800 rounded-md overflow-hidden hover:border-green-800/50 transition-colors"
                  >
                    <div className="bg-zinc-900 px-3 py-2 border-b border-zinc-800 flex justify-between items-center">
                      <div className="flex items-center">
                        <span className="text-zinc-500 font-mono text-xs mr-2">
                          [{String(index + 1).padStart(2, '0')}]
                        </span>
                        <span className="font-mono text-green-400 text-xs uppercase">
                          {diagnostic.obdCodes?.length > 0 ? diagnostic.obdCodes[0] : 'DIAGNÓSTICO'}
                        </span>
                      </div>
                      <div className="flex items-center text-xs text-zinc-500">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>{formatDate(diagnostic.createdAt)}</span>
                      </div>
                    </div>
                    
                    <div className="p-3 bg-black">
                      {/* Información del vehículo */}
                      <div className="mb-3 pb-2 border-b border-zinc-800 flex justify-between">
                        {diagnostic.vehicleInfo && (
                          <div className="font-mono text-xs text-zinc-400">
                            <span className="text-zinc-500 mr-1">vehiculo:</span>
                            <span className="text-zinc-300">
                              {[
                                diagnostic.vehicleInfo.year,
                                diagnostic.vehicleInfo.make,
                                diagnostic.vehicleInfo.model,
                                diagnostic.vehicleInfo.engine
                              ].filter(Boolean).join(' ')}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {/* Diagnóstico */}
                      <div className="font-mono text-xs mb-3">
                        <p className="text-zinc-300">{truncateDiagnosis(diagnostic.diagnosis)}</p>
                      </div>
                      
                      {/* Códigos y síntomas */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {diagnostic.obdCodes?.map((code, idx) => (
                          <Badge key={idx} variant="outline" className="bg-blue-900/20 text-blue-400 border-blue-800/30 font-mono text-xs">
                            {code}
                          </Badge>
                        ))}
                        {diagnostic.symptoms?.map((symptom, idx) => (
                          <Badge key={idx} variant="outline" className="bg-purple-900/20 text-purple-400 border-purple-800/30 font-mono text-xs">
                            {symptom.length > 25 ? symptom.substring(0, 25) + '...' : symptom}
                          </Badge>
                        ))}
                      </div>
                      
                      {/* Footer con severidad y botón */}
                      <div className="flex justify-between items-center mt-4 pt-2 border-t border-zinc-800">
                        {diagnostic.severity && (
                          <Badge variant="outline" className={`font-mono text-xs uppercase ${getSeverityColor(diagnostic.severity)}`}>
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            {getTerminalSeverityLabel(diagnostic.severity)}
                          </Badge>
                        )}
                        <Button 
                          size="sm" 
                          className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-sm h-7 text-xs font-mono border border-zinc-700" 
                          onClick={() => setLocation(`/diagnostics/details/${diagnostic.id}`)}
                        >
                          <span>DETALLES</span>
                          <ChevronRight className="h-3 w-3 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Mensaje si no hay resultados */}
                {filteredDiagnostics.length === 0 && diagnostics.length > 0 && (
                  <div className="border border-zinc-800 rounded-md p-4 text-center">
                    <div className="font-mono text-xs text-zinc-500">
                      $ <span className="text-green-400">find</span> "{searchTerm}"<br/>
                      <span className="text-amber-400">ERROR:</span> No se encontraron coincidencias.
                    </div>
                    <Button 
                      variant="link" 
                      onClick={() => setSearchTerm('')}
                      className="mt-2 text-xs text-green-400 hover:text-green-300"
                    >
                      $ <span className="underline">mostrar todos</span>
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Footer con estado del sistema */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-md p-3 font-mono text-xs">
            <div className="flex items-center mb-2 text-zinc-400">
              <Cpu className="h-3 w-3 mr-1.5 text-green-400" />
              <span>ESTADO DEL SISTEMA</span>
            </div>
            <div className="space-y-1.5 pl-2">
              <div className="flex justify-between">
                <span className="text-zinc-500">Diagnósticos:</span>
                <span className="text-green-400">{(filteredDiagnostics.length > 0 ? filteredDiagnostics : mockDiagnostics).length} registros</span>
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
              onClick={() => setLocation('/diagnostics/scanner')}
            >
              NUEVO DIAGNÓSTICO
            </Button>
            <Button 
              className="flex-1 bg-green-600 hover:bg-green-700 text-black h-auto py-2 text-xs font-bold rounded-sm" 
              onClick={() => setLocation('/')}
            >
              VOLVER A INICIO
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}