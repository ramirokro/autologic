import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/app-context';
import { useLocation } from 'wouter';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'wouter';
import { AlertCircle, LogIn, Terminal, Cpu } from 'lucide-react';

// Esquema de validación para el formulario de login
const loginSchema = z.object({
  email: z.string().email('Ingresa un correo electrónico válido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const { login } = useAuth();
  const [, navigate] = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();
  const [bootSequence, setBootSequence] = useState(true);
  const [bootStage, setBootStage] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [cursorVisible, setCursorVisible] = useState(true);
  
  // Animación de escritura y parpadeo del cursor
  useEffect(() => {
    // Iniciar secuencia de boot
    if (bootSequence) {
      const bootMessages = [
        "Iniciando OBi-2 Authentication Module v3.7.2...",
        "Estableciendo conexión con servidor de autenticación...",
        "Cargando protocolos de seguridad...",
        "Cargando interfaz de usuario...",
        "Sistema listo."
      ];
      
      const timer = setTimeout(() => {
        if (bootStage < bootMessages.length) {
          setBootStage(prev => prev + 1);
        } else {
          setBootSequence(false);
        }
      }, 800);
      
      return () => clearTimeout(timer);
    }
    
    // Efecto de parpadeo del cursor
    const cursorInterval = setInterval(() => {
      setCursorVisible(prev => !prev);
    }, 530);
    
    return () => clearInterval(cursorInterval);
  }, [bootSequence, bootStage]);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: LoginFormValues) {
    try {
      setError('');
      setLoading(true);
      await login(values.email, values.password);
      toast({
        title: 'ACCESO AUTORIZADO',
        description: 'Bienvenido al sistema de diagnóstico OBi-2',
        variant: 'default', // Estilo consola
      });
      navigate('/');
    } catch (err: any) {
      console.error(err);
      switch (err.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          setError('ERROR: Credenciales inválidas. Acceso denegado.');
          break;
        case 'auth/too-many-requests':
          setError('ALERTA: Demasiados intentos fallidos. Sistema bloqueado temporalmente.');
          break;
        default:
          setError(`ERROR ${err.code || '0x8F24'}: Fallo en autenticación. ${err.message || 'Reintente acceso.'}`);
      }
    } finally {
      setLoading(false);
    }
  }

  // Si está en la secuencia de arranque, mostrar animación
  if (bootSequence) {
    const bootMessages = [
      "Iniciando OBi-2 Authentication Module v3.7.2...",
      "Estableciendo conexión con servidor de autenticación...",
      "Cargando protocolos de seguridad...",
      "Cargando interfaz de usuario...",
      "Sistema listo."
    ];
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-black p-4">
        <div className="w-full max-w-md p-6 rounded-md border border-green-500 bg-black text-green-500 font-mono">
          <div className="flex items-center gap-3 mb-6 border-b border-green-500/30 pb-3">
            <Terminal className="h-5 w-5" />
            <span className="text-sm font-bold">AUTOLOGIC OBi-2 SYSTEM v4.2.1</span>
          </div>
          
          <div className="space-y-2">
            {bootMessages.slice(0, bootStage).map((message, index) => (
              <div key={index} className="flex items-start gap-2">
                <span className="text-green-400">$</span>
                <span>{message}</span>
              </div>
            ))}
            
            {bootStage < bootMessages.length && (
              <div className="flex items-start gap-2">
                <span className="text-green-400">$</span>
                <span className="animate-pulse">_</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="w-full max-w-md p-6 rounded-md border border-green-500 bg-black text-green-500 font-mono">
        {/* Cabecera tipo terminal */}
        <div className="flex items-center justify-between mb-6 border-b border-green-500/30 pb-3">
          <div className="flex items-center gap-2">
            <Terminal className="h-5 w-5" />
            <span className="text-sm font-bold">AUTOLOGIC LOGIN v4.2.1</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-red-500"></div>
            <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
            <div className="h-2 w-2 rounded-full bg-green-500"></div>
          </div>
        </div>
        
        {/* Título y prompt */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Cpu className="h-4 w-4 text-green-400" />
            <h1 className="text-xl font-bold tracking-tight">SISTEMA DE AUTENTICACIÓN</h1>
          </div>
          <p className="text-green-400/80 text-sm ml-6">// Por favor ingrese sus credenciales de acceso</p>
        </div>
        
        {/* Error en estilo terminal */}
        {error && (
          <div className="mb-4 px-3 py-2 border border-red-500/50 bg-red-950/30 text-red-500 rounded text-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <code className="font-mono">{error}</code>
            </div>
          </div>
        )}
        
        {/* Formulario estilo terminal */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-2">
                    <span className="text-green-400">$</span>
                    <FormLabel className="text-green-300">usuario_email:</FormLabel>
                  </div>
                  <FormControl>
                    <Input 
                      placeholder="tu@correo.com" 
                      {...field} 
                      className="ml-5 font-mono bg-green-950/20 border-green-500/30 text-green-300 placeholder:text-green-700/50 focus:border-green-400"
                    />
                  </FormControl>
                  <FormMessage className="ml-5 text-amber-400" />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-2">
                    <span className="text-green-400">$</span>
                    <FormLabel className="text-green-300">contraseña:</FormLabel>
                  </div>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="••••••" 
                      {...field} 
                      className="ml-5 font-mono bg-green-950/20 border-green-500/30 text-green-300 placeholder:text-green-700/50 focus:border-green-400"
                    />
                  </FormControl>
                  <FormMessage className="ml-5 text-amber-400" />
                </FormItem>
              )}
            />
            
            <div className="pt-2">
              <Button 
                type="submit" 
                disabled={loading}
                className="w-full bg-green-900 hover:bg-green-800 text-green-50 border border-green-500 hover:shadow-[0_0_10px_rgba(34,197,94,0.3)] transition-all duration-300"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    AUTENTICANDO...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <span>INICIAR SESIÓN</span>
                    <span className={cursorVisible ? "opacity-100" : "opacity-0"}>▋</span>
                  </span>
                )}
              </Button>
            </div>
          </form>
        </Form>
        
        {/* Enlaces de estilo terminal */}
        <div className="mt-6 pt-4 border-t border-green-500/30 text-center space-y-2">
          <div className="flex items-center gap-2 justify-center">
            <span className="text-green-400 text-sm">$</span>
            <span className="text-green-300 text-sm">nuevo_usuario</span>
            <Link 
              href="/signup" 
              className="text-green-500 hover:text-green-400 text-sm hover:underline"
            >
              --registrar
            </Link>
          </div>
          <div className="flex items-center gap-2 justify-center">
            <span className="text-green-400 text-sm">$</span>
            <span className="text-green-300 text-sm">recuperar</span>
            <Link 
              href="/forgot-password" 
              className="text-yellow-500 hover:text-yellow-400 text-sm hover:underline"
            >
              --contraseña
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}