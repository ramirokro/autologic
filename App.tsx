import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Catalog from "@/pages/catalog";
import Product from "@/pages/product";
import Compare from "@/pages/compare";
import Diagnostics from "@/pages/diagnostics";
import DiagnosticScanner from "@/pages/diagnostics/scanner";
import DiagnosticSymptoms from "@/pages/diagnostics/symptoms";
import DiagnosticHistory from "@/pages/diagnostics/history";
import DiagnosticDetails from "@/pages/diagnostics/details";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import ForgotPassword from "@/pages/forgot-password";
import Profile from "@/pages/profile";
import Analytics from "@/pages/analytics";
import Videos from "@/pages/videos";
import Video from "@/pages/video";
import VehicleHealth from "@/pages/vehicleHealth";
import MyVehiclesPage from "@/pages/my-vehicles-new";
import { AppProvider } from "./lib/app-context";
// Eliminado el ThemeSelector
import { ThemeInitializer } from "@/components/theme/ThemeInitializer";

function Router() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Se eliminó el botón de cambio de tema */}
      
      <div className="flex-grow">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/diagnostics/scanner" component={DiagnosticScanner} />
          <Route path="/diagnostics/symptoms" component={DiagnosticSymptoms} />
          <Route path="/diagnostics/history" component={DiagnosticHistory} />
          <Route path="/diagnostics/details/:id" component={DiagnosticDetails} />
          <Route path="/diagnostics" component={Diagnostics} />
          <Route path="/catalog" component={Catalog} />
          <Route path="/product/:id" component={Product} />
          <Route path="/compare" component={Compare} />
          <Route path="/videos/:id" component={Video} />
          <Route path="/videos" component={Videos} />
          <Route path="/vehicle-health" component={VehicleHealth} />
          <Route path="/login" component={Login} />
          <Route path="/signup" component={Signup} />
          <Route path="/forgot-password" component={ForgotPassword} />
          <Route path="/profile" component={Profile} />
          <Route path="/my-vehicles" component={MyVehiclesPage} />
          <Route component={NotFound} />
        </Switch>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        {/* Inicializa el tema desde localStorage */}
        <ThemeInitializer />
        <Router />
        <Toaster />
      </AppProvider>
    </QueryClientProvider>
  );
}

export default App;
