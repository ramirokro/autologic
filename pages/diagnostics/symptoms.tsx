import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, CheckCircle2, AlertTriangle, MessageSquare, Send } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function SymptomsDiagnostic() {
  const [, setLocation] = useLocation();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hola, soy tu asistente Autologic. Vamos a revisar qué podría estar pasando en tu auto.'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Questions for guided diagnostics
  const commonSymptoms = [
    "¿Tu auto enciende normalmente?",
    "¿Notas ruidos extraños al acelerar?",
    "¿Se enciende alguna luz en el tablero?",
    "¿Sale humo del escape?",
    "¿Tiene problemas al frenar?",
    "¿El motor se sobrecalienta?",
  ];

  // Auto scroll to bottom of chat
  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsThinking(true);

    try {
      // Simulación de interacción con Claude AI
      // En un escenario real, usaríamos la API de Anthropic aquí
      setTimeout(() => {
        const responses: Record<string, string> = {
          "Sí sale humo": "Entiendo... eso puede ser señal de un problema con el sistema eléctrico. Vamos a investigar un poco más.",
          "¿Has notado alguna luz en el tablero ultimamente?": "Si se enciende alguna luz en el tablero, es importante saber cuál es. ¿Podrías describir qué luz se enciende?",
          "Si": "Gracias. Vamos a ver qué encontramos...",
          "¿Tu auto enciende normalmente?": "¿Podrías describir cómo enciende el vehículo? ¿Hay algún sonido o comportamiento extraño?",
          "¿Notas ruidos extraños al acelerar?": "Los ruidos al acelerar pueden indicar varios problemas diferentes. ¿Puedes describir cómo es el ruido?",
          "¿Se enciende alguna luz en el tablero?": "¿Qué luz específica se enciende? Las luces del tablero son indicadores importantes del sistema."
        };

        let responseText = "Gracias por la información. Basado en lo que me dices, parece haber una falla en el sensor de oxígeno. Este componente es crucial para el correcto funcionamiento del sistema de emisiones y puede afectar el rendimiento del motor.";

        // Si hay una respuesta específica para el texto, la usamos
        if (responses[text]) {
          responseText = responses[text];
        }

        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: responseText
        };

        setMessages(prev => [...prev, assistantMessage]);
        setIsThinking(false);
      }, 1500);
      
    } catch (error) {
      console.error('Error al enviar el mensaje:', error);
      setIsThinking(false);
      
      // Mensaje de error
      setMessages(prev => [
        ...prev, 
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: 'Lo siento, ha ocurrido un error al procesar tu mensaje. Por favor, intenta nuevamente.'
        }
      ]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border p-4 flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={() => setLocation('/')}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <span className="ml-2 font-semibold uppercase tracking-wide">AUTOLOGIC</span>
        </div>
      </header>

      {/* Main content - Chat interface */}
      <main className="flex-1 overflow-hidden flex flex-col">
        {/* Chat messages */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.length === 1 && (
              <div className="mb-6">
                <h1 className="text-2xl font-bold mb-4">¿Qué síntomas presenta tu auto?</h1>
                <p className="text-muted-foreground mb-6">
                  Te haremos unas preguntas para ayudarte a identificar posibles fallas.
                </p>
                
                <div className="grid grid-cols-1 gap-2 mb-4">
                  {commonSymptoms.map((symptom, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="justify-start h-auto py-3 px-4 text-left"
                      onClick={() => sendMessage(symptom)}
                    >
                      <CheckCircle2 className="mr-2 h-5 w-5 flex-shrink-0" />
                      <span>{symptom}</span>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`
                    max-w-[80%] rounded-lg px-4 py-3
                    ${message.role === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-foreground'
                    }
                  `}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}

            {isThinking && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-lg px-4 py-2 bg-muted text-foreground">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/60 animate-bounce"></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Message input */}
        <div className="border-t border-border p-4 bg-background/80 backdrop-blur-sm">
          <form 
            onSubmit={handleSubmit}
            className="max-w-3xl mx-auto flex items-center space-x-2"
          >
            <div className="relative flex-1">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Describe los síntomas de tu auto..."
                className="w-full border border-input rounded-md py-2 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
                disabled={isThinking}
              />
            </div>
            <Button 
              type="submit" 
              size="icon" 
              disabled={!inputValue.trim() || isThinking}
            >
              <Send className="h-5 w-5" />
              <span className="sr-only">Enviar mensaje</span>
            </Button>
          </form>

          {messages.length > 3 && (
            <div className="max-w-3xl mx-auto mt-4 flex justify-end">
              <Button variant="outline" size="sm" asChild>
                <Link href="/diagnostics/results/1">
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Ver diagnóstico completo
                </Link>
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}