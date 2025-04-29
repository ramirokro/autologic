import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AutologicLogo from '@/components/ui/autologic-logo';
import { 
  Terminal,
  Car, 
  History,
  ScanLine,
  Database,
  Cpu,
  ShieldAlert,
  Settings,
  MessageSquare
} from 'lucide-react';

export default function Home() {
  const [, setLocation] = useLocation();
  const [bootText, setBootText] = useState<string[]>([]);
  const [bootComplete, setBootComplete] = useState(false);
  const [activeTab, setActiveTab] = useState('diagnostics');

  useEffect(() => {
    // Simulamos la secuencia de inicio de terminal
    const bootSequence = [
      "Iniciando sistema AUTOLOGIC OS v3.5...",
      "Cargando módulos de diagnóstico...",
      "Conectando a la base de datos de vehículos...",
      "Cargando interfaz de usuario...",
      "Inicializando OBi-2 AI Engine...",
      "Sistema listo."
    ];
    
    let currentIndex = 0;
    const intervalId = setInterval(() => {
      if (currentIndex < bootSequence.length) {
        setBootText(prev => [...prev, bootSequence[currentIndex]]);
        currentIndex++;
      } else {
        clearInterval(intervalId);
        setTimeout(() => setBootComplete(true), 500);
      }
    }, 300);
    
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-800 p-4 bg-black flex items-center justify-between">
        <div className="flex items-center">
          <div className="flex items-center gap-2">
            <AutologicLogo size="md" />
            <span className="text-xs bg-zinc-800 px-1.5 py-0.5 rounded text-green-400 font-mono">v3.5</span>
          </div>
        </div>
        <div className="flex items-center">
          <div className="w-2 h-2 rounded-full bg-green-500 mr-1.5 animate-pulse"></div>
          <span className="text-xs text-zinc-500 font-mono">SISTEMA ACTIVO</span>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col p-6">
        <div className="w-full max-w-3xl mx-auto">
          {!bootComplete ? (
            // Terminal boot sequence
            <div className="bg-black border border-zinc-800 rounded-md p-4 font-mono text-green-400 text-sm">
              <div className="mb-2 flex items-center">
                <Terminal className="h-4 w-4 mr-2" />
                <span className="text-xs">AUTOLOGIC BOOT SEQUENCE</span>
              </div>
              <div className="space-y-1">
                {bootText.map((line, index) => (
                  <div key={index} className="flex">
                    <span className="text-zinc-500 mr-2">${index + 1}:</span>
                    <span>{line}</span>
                  </div>
                ))}
                {bootText.length < 6 && (
                  <div className="flex">
                    <span className="text-zinc-500 mr-2">${bootText.length + 1}:</span>
                    <span className="inline-block animate-blink">_</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="mb-8 bg-zinc-900 border border-zinc-800 rounded-md p-4 font-mono">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center">
                    <AutologicLogo size="sm" />
                    <h1 className="ml-2 text-lg font-bold text-green-400 font-mono">
                      TERMINAL
                    </h1>
                  </div>
                  <div className="flex space-x-1">
                    <div className="w-3 h-3 rounded-full bg-zinc-700"></div>
                    <div className="w-3 h-3 rounded-full bg-zinc-700"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                  </div>
                </div>
                
                <div className="mb-3 p-2 bg-zinc-950 border border-zinc-800 rounded text-green-300 text-sm">
                  <div className="flex items-start mb-1">
                    <span className="text-zinc-500 mr-2">$</span>
                    <span className="text-green-400">./bienvenida.sh</span>
                  </div>
                  <p className="ml-4 mt-2 text-xs">
                    Bienvenido al Sistema de Diagnóstico Automotriz Inteligente.
                    <br />
                    OBi-2 está listo para analizar tu vehículo y proporcionar soluciones precisas.
                  </p>
                </div>
                
                <div className="text-zinc-400 text-xs mb-2">Selecciona un modo de diagnóstico:</div>

                <div className="border border-zinc-800 rounded overflow-hidden">
                  <div className="bg-zinc-800 px-2 py-1.5 flex">
                    <button 
                      className={`px-3 py-1 mr-2 text-xs font-mono rounded ${activeTab === 'diagnostics' ? 'bg-green-900 text-green-300' : 'text-zinc-400 hover:text-zinc-200'}`}
                      onClick={() => setActiveTab('diagnostics')}
                    >
                      diagnostico.sh
                    </button>
                    <button 
                      className={`px-3 py-1 text-xs font-mono rounded ${activeTab === 'history' ? 'bg-green-900 text-green-300' : 'text-zinc-400 hover:text-zinc-200'}`}
                      onClick={() => setActiveTab('history')}
                    >
                      historial.sh
                    </button>
                  </div>
                  
                  <div className="p-3 bg-zinc-900">
                    {activeTab === 'diagnostics' ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div 
                          className="p-3 border border-zinc-800 bg-zinc-900 hover:border-green-800 rounded-md transition-colors cursor-pointer" 
                          onClick={() => setLocation('/diagnostics')}
                        >
                          <div className="flex items-center mb-2">
                            <div className="w-8 h-8 rounded-md bg-zinc-800 border border-zinc-700 flex items-center justify-center mr-2">
                              <Terminal className="h-4 w-4 text-green-400" />
                            </div>
                            <div>
                              <h3 className="font-mono text-green-400 text-sm">OBi-2 AI</h3>
                              <div className="h-1 w-16 bg-zinc-800 rounded-full overflow-hidden mt-1">
                                <div className="h-full w-3/4 bg-green-500 animate-pulse rounded-full"></div>
                              </div>
                            </div>
                          </div>
                          <p className="text-xs text-zinc-400 ml-10">Interfaz de diagnóstico inteligente con asistente virtual</p>
                        </div>

                        <div 
                          className="p-3 border border-zinc-800 bg-zinc-900 hover:border-amber-800 rounded-md transition-colors cursor-pointer" 
                          onClick={() => setLocation('/diagnostics/scanner')}
                        >
                          <div className="flex items-center mb-2">
                            <div className="w-8 h-8 rounded-md bg-zinc-800 border border-zinc-700 flex items-center justify-center mr-2">
                              <ScanLine className="h-4 w-4 text-amber-400" />
                            </div>
                            <div>
                              <h3 className="font-mono text-amber-400 text-sm">SCANNER OBD</h3>
                              <div className="h-1 w-16 bg-zinc-800 rounded-full overflow-hidden mt-1">
                                <div className="h-full w-1/2 bg-amber-500 animate-pulse rounded-full"></div>
                              </div>
                            </div>
                          </div>
                          <p className="text-xs text-zinc-400 ml-10">Interpretación de códigos de error del vehículo</p>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div 
                          className="p-3 border border-zinc-800 bg-zinc-900 hover:border-blue-800 rounded-md transition-colors cursor-pointer" 
                          onClick={() => setLocation('/diagnostics/history')}
                        >
                          <div className="flex items-center mb-2">
                            <div className="w-8 h-8 rounded-md bg-zinc-800 border border-zinc-700 flex items-center justify-center mr-2">
                              <Database className="h-4 w-4 text-blue-400" />
                            </div>
                            <div>
                              <h3 className="font-mono text-blue-400 text-sm">HISTORIAL</h3>
                              <div className="h-1 w-16 bg-zinc-800 rounded-full overflow-hidden mt-1">
                                <div className="h-full w-1/4 bg-blue-500 animate-pulse rounded-full"></div>
                              </div>
                            </div>
                          </div>
                          <p className="text-xs text-zinc-400 ml-10">Accede a tus análisis y diagnósticos anteriores</p>
                        </div>
                        
                        <div 
                          className="p-3 border border-zinc-800 bg-zinc-900 hover:border-purple-800 rounded-md transition-colors cursor-pointer" 
                          onClick={() => setLocation('/my-vehicles')}
                        >
                          <div className="flex items-center mb-2">
                            <div className="w-8 h-8 rounded-md bg-zinc-800 border border-zinc-700 flex items-center justify-center mr-2">
                              <Car className="h-4 w-4 text-purple-400" />
                            </div>
                            <div>
                              <h3 className="font-mono text-purple-400 text-sm">MIS VEHÍCULOS</h3>
                              <div className="h-1 w-16 bg-zinc-800 rounded-full overflow-hidden mt-1">
                                <div className="h-full w-2/3 bg-purple-500 animate-pulse rounded-full"></div>
                              </div>
                            </div>
                          </div>
                          <p className="text-xs text-zinc-400 ml-10">Gestiona tu flota de vehículos registrados</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="bg-zinc-900 border border-zinc-800 rounded-md p-3 font-mono text-xs">
                <div className="flex items-center mb-2 text-zinc-400">
                  <ShieldAlert className="h-3 w-3 mr-1.5 text-green-400" />
                  <span>ESTADO DEL SISTEMA</span>
                </div>
                <div className="space-y-1.5 pl-2">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">OBi-2 AI:</span>
                    <span className="text-green-400">Online</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Base de Datos:</span>
                    <span className="text-green-400">Conectada</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Versión:</span>
                    <span className="text-green-400">3.5.12-stable</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Último update:</span>
                    <span className="text-green-400">18/04/2025</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-3 px-6 border-t border-zinc-800 bg-black">
        <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center">
            <AutologicLogo size="xs" />
            <span className="text-xs text-zinc-500 font-mono ml-1">v3.5 © 2025</span>
          </div>
          <div className="flex space-x-4 mt-1.5 md:mt-0">
            <a href="#" className="text-xs text-zinc-600 hover:text-zinc-400 font-mono">terms.txt</a>
            <a href="#" className="text-xs text-zinc-600 hover:text-zinc-400 font-mono">privacy.md</a>
            <a href="#" className="text-xs text-zinc-600 hover:text-zinc-400 font-mono">help.sh</a>
          </div>
        </div>
      </footer>
    </div>
  );
}