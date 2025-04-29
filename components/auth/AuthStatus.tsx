import { useAuth } from "@/lib/app-context";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldAlert, ShieldCheck } from "lucide-react";

export default function AuthStatus() {
  const { currentUser } = useAuth();

  return (
    <div className="my-4">
      {currentUser ? (
        <Alert className="bg-green-50 border-green-200">
          <ShieldCheck className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Sesión iniciada</AlertTitle>
          <AlertDescription className="text-green-700">
            Has iniciado sesión como <span className="font-semibold">{currentUser.email}</span>
          </AlertDescription>
        </Alert>
      ) : (
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>No has iniciado sesión</AlertTitle>
          <AlertDescription>
            Inicia sesión para acceder a todas las funcionalidades.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}