import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { registerProductRoutes } from "./controllers/products";
import { registerVehicleRoutes } from "./controllers/vehicles";
import { registerCompatibilityRoutes } from "./controllers/compatibility";
import { registerDiagnosticRoutes } from "./controllers/diagnostics";
import { registerAnalyticsRoutes } from "./controllers/analytics";
import { registerVideoRoutes } from "./controllers/videos";
import { registerVehicleHealthRoutes } from "./controllers/vehicleHealthRoutes";
import { registerShopifyRoutes } from "./controllers/shopify";
import smartcarRoutes from './routes/smartcar';
import * as smartcarAPI from './smartcar';
import multer from "multer";
import path from "path";
import fs from "fs";
import { log } from "./vite";

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(import.meta.dirname, "..", "uploads"));
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
    },
  }),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max file size
  },
  fileFilter: (req, file, cb) => {
    // Accept only csv and xml files
    const fileTypes = /csv|xml/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error("Only CSV and XML files are allowed"));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes prefix
  const apiPrefix = "/api";

  // Inicializar configuración de SmartCar
  try {
    await smartcarAPI.initializeSmartcarConfig();
    console.log("SmartCar configuration initialized successfully");
  } catch (error) {
    console.error("Failed to initialize SmartCar configuration:", error);
  }

  // Register all controllers
  registerProductRoutes(app, apiPrefix, storage);
  registerVehicleRoutes(app, apiPrefix, storage);
  registerCompatibilityRoutes(app, apiPrefix, storage);
  registerDiagnosticRoutes(app, apiPrefix, storage);
  registerAnalyticsRoutes(app, apiPrefix, storage);
  registerVideoRoutes(app, apiPrefix, storage);
  registerVehicleHealthRoutes(app, apiPrefix, storage);
  registerShopifyRoutes(app, apiPrefix);
  
  // Register SmartCar routes
  app.use(`${apiPrefix}/smartcar`, smartcarRoutes);
  
  // API para cambiar tema
  app.post(`${apiPrefix}/theme`, (req, res) => {
    try {
      const themeData = req.body;
      
      // Validación básica
      if (!themeData.primary || !themeData.variant || !themeData.appearance) {
        return res.status(400).json({ error: "Datos de tema incompletos" });
      }
      
      // Leer y actualizar el archivo theme.json
      const themePath = path.resolve(process.cwd(), 'theme.json');
      fs.writeFileSync(themePath, JSON.stringify(themeData, null, 2));
      
      log(`Tema actualizado: ${JSON.stringify(themeData)}`, "theme");
      
      return res.json({ success: true, theme: themeData });
    } catch (error) {
      console.error("Error al actualizar el tema:", error);
      return res.status(500).json({ error: "Error al actualizar el tema" });
    }
  });

  // Import data endpoint
  app.post(`${apiPrefix}/import`, upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      const options = req.body.options ? JSON.parse(req.body.options) : {};
      
      // File path of the uploaded file
      const filePath = req.file.path;
      
      // Process import based on the options type
      if (options.type === "products") {
        // Import products
        const importResult = await importProducts(filePath, options);
        return res.json(importResult);
      } else {
        // Import compatibility
        const importResult = await importCompatibility(filePath, options);
        return res.json(importResult);
      }
    } catch (error) {
      console.error("Import error:", error);
      return res.status(500).json({ 
        message: error instanceof Error ? error.message : "Error processing import" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Helper functions for data import
async function importProducts(filePath: string, options: any) {
  // Implementation for product import
  // In a real app, this would parse the file and interact with the database
  return {
    imported: 42,
    updated: options.updateExisting ? 12 : 0,
    errors: []
  };
}

async function importCompatibility(filePath: string, options: any) {
  // Implementation for compatibility import
  // In a real app, this would parse the file and interact with the database
  return {
    imported: 157,
    updated: options.updateExisting ? 35 : 0,
    deleted: options.deleteExisting ? 22 : 0,
    errors: []
  };
}
