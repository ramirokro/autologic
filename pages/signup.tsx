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
import { AlertCircle, UserPlus, Terminal, Cpu } from 'lucide-react';

// Esquema de validación para el formulario de registro
const signupSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Ingresa un correo electrónico válido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmPassword: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function Signup() {
  const { signup } = useAuth();
  const [, navigate] = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();
  const [bootSequence, setBootSequence] = useState(true);
  const [bootStage, setBootStage] = useState(0);
  const [cursorVisible, setCursorVisible] = useState(true);
  
  // Animación de escritura y parpadeo del cursor
  useEffect(() => {
    // Iniciar secuencia de boot
    if (bootSequence) {
      const bootMessages = [
        "Iniciando OBi-2 User Registration Module v2.4.1...",
        "Configurando protocolos de seguridad...",
        "Estableciendo conexión con base de datos...",
        "Preparando formulario de registro...",
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

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  async function onSubmit(values: SignupFormValues) {
    try {
      setError('');
      setLoading(true);
      console.log("Iniciando registro con:", { email: values.email, name: values.name });
      await signup(values.email, values.password, values.name);
      toast({
        title: 'USUARIO REGISTRADO',
        description: 'Perfil creado con éxito. Bienvenido a OBi-2.',
        variant: 'default',
      });
      navigate('/');
    } catch (err: any) {
      console.error("Error de registro detallado:", err);
      
      // Manejo mejorado de errores en estilo terminal
      switch (err.code) {
        case 'auth/email-already-in-use':
          setError('ERROR 0x4F8A: Usuario ya existe en la base de datos.');
          break;
        case 'auth/invalid-email':
          setError('ERROR 0x3C21: Formato de correo inválido.');
          break;
        case 'auth/weak-password':
          setError('ALERTA 0x2D5B: Seguridad insuficiente. Se requiere contraseña más robusta.');
          break;
        case 'auth/configuration-not-found':
          setError('ERROR 0x7F33: Fallo de configuración del sistema de autenticación.');
          console.error("Detalles: Verificar configuración de Firebase");
          break;
        case 'auth/network-request-failed':
          setError('ERROR 0x1A7B: Fallo de conexión. Verificar red.');
          break;
        default:
          setError(`ERROR ${err.code || '0xFFFF'}: ${err.message || 'Fallo de sistema no identificado'}`);
      }
    } finally {
      setLoading(false);
    }
  }

  // Si está en la secuencia de arranque, mostrar animación
  if (bootSequence) {
    const bootMessages = [
      "Iniciando OBi-2 User Registration Module v2.4.1...",
      "Configurando protocolos de seguridad...",
      "Estableciendo conexión con base de datos...",
      "Preparando formulario de registro...",
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
            <span className="text-sm font-bold">USER_REGISTRATION.sh v4.2.1</span>
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
            <h1 className="text-xl font-bold tracking-tight">REGISTRO DE NUEVO USUARIO</h1>
          </div>
          <p className="text-green-400/80 text-sm ml-6">// Complete todos los campos para crear su perfil</p>
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
              name="name"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-2">
                    <span className="text-green-400">$</span>
                    <FormLabel className="text-green-300">nombre_usuario:</FormLabel>
                  </div>
                  <FormControl>
                    <Input 
                      placeholder="Tu nombre" 
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
              name="email"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-2">
                    <span className="text-green-400">$</span>
                    <FormLabel className="text-green-300">email:</FormLabel>
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
                    <FormLabel className="text-green-300">password:</FormLabel>
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
            
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-2">
                    <span className="text-green-400">$</span>
                    <FormLabel className="text-green-300">confirm_password:</FormLabel>
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
                    PROCESANDO REGISTRO...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    <span>CREAR USUARIO</span>
                    <span className={cursorVisible ? "opacity-100" : "opacity-0"}>▋</span>
                  </span>
                )}
              </Button>
            </div>
          </form>
        </Form>
        
        {/* Enlaces de estilo terminal */}
        <div className="mt-6 pt-4 border-t border-green-500/30 text-center">
          <div className="flex items-center gap-2 justify-center">
            <span className="text-green-400 text-sm">$</span>
            <span className="text-green-300 text-sm">usuario_existente</span>
            <Link 
              href="/login" 
              className="text-green-500 hover:text-green-400 text-sm hover:underline"
            >
              --login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}