import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { VehicleProvider } from "./lib/vehicle-context";

createRoot(document.getElementById("root")!).render(
  <VehicleProvider>
    <App />
  </VehicleProvider>
);
