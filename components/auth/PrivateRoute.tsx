import { ReactNode } from 'react';
import { useLocation, Redirect } from 'wouter';
import { useAuth } from '@/lib/app-context';
import { Spinner } from '@/components/ui/spinner';

interface PrivateRouteProps {
  children: ReactNode;
}

export function PrivateRoute({ children }: PrivateRouteProps) {
  const { currentUser, loading } = useAuth();
  const [, setLocation] = useLocation();

  // Si todavía estamos verificando el estado de autenticación, mostramos un spinner
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  // Si el usuario no está autenticado, redirigimos a la página de login
  if (!currentUser) {
    return <Redirect to="/login" />;
  }

  // Si el usuario está autenticado, mostramos el contenido
  return <>{children}</>;
}