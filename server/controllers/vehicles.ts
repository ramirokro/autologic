import { Express } from "express";
import { IStorage } from "../storage";
import { insertVehicleSchema, Vehicle } from "@shared/schema";

/**
 * Registers vehicle-related routes
 * @param app Express app instance
 * @param prefix API route prefix
 * @param storage Storage interface
 */
export function registerVehicleRoutes(app: Express, prefix: string, storage: IStorage) {
  
  // Get all vehicles with optional filters
  app.get(`${prefix}/vehicles`, async (req, res) => {
    try {
      const { year, make, model, engine } = req.query;
      const filters: Partial<Vehicle> = {};
      
      if (year) {
        filters.year = parseInt(year as string);
      }
      
      if (make) {
        filters.make = make as string;
      }
      
      if (model) {
        filters.model = model as string;
      }
      
      if (engine) {
        filters.engine = engine as string;
      }
      
      const vehicles = await storage.getVehicles(filters);
      res.json(vehicles);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      res.status(500).json({ message: "Error fetching vehicles" });
    }
  });
  
  // Get unique years
  app.get(`${prefix}/vehicles/year`, async (req, res) => {
    try {
      const years = await storage.getUniqueVehicleValues('year', {});
      res.json(years);
    } catch (error) {
      console.error("Error fetching vehicle years:", error);
      res.status(500).json({ message: "Error fetching vehicle years" });
    }
  });
  
  // Get unique makes for a given year
  app.get(`${prefix}/vehicles/make`, async (req, res) => {
    try {
      const { year } = req.query;
      const filters: Partial<Vehicle> = {};
      
      if (year) {
        filters.year = parseInt(year as string);
      }
      
      const makes = await storage.getUniqueVehicleValues('make', filters);
      res.json(makes);
    } catch (error) {
      console.error("Error fetching vehicle makes:", error);
      res.status(500).json({ message: "Error fetching vehicle makes" });
    }
  });
  
  // Get unique models for a given year and make
  app.get(`${prefix}/vehicles/model`, async (req, res) => {
    try {
      const { year, make } = req.query;
      const filters: Partial<Vehicle> = {};
      
      if (year) {
        filters.year = parseInt(year as string);
      }
      
      if (make) {
        filters.make = make as string;
      }
      
      const models = await storage.getUniqueVehicleValues('model', filters);
      res.json(models);
    } catch (error) {
      console.error("Error fetching vehicle models:", error);
      res.status(500).json({ message: "Error fetching vehicle models" });
    }
  });
  
  // Get unique engines for a given year, make, and model
  app.get(`${prefix}/vehicles/engine`, async (req, res) => {
    try {
      const { year, make, model } = req.query;
      const filters: Partial<Vehicle> = {};
      
      if (year) {
        filters.year = parseInt(year as string);
      }
      
      if (make) {
        filters.make = make as string;
      }
      
      if (model) {
        filters.model = model as string;
      }
      
      const engines = await storage.getUniqueVehicleValues('engine', filters);
      res.json(engines);
    } catch (error) {
      console.error("Error fetching vehicle engines:", error);
      res.status(500).json({ message: "Error fetching vehicle engines" });
    }
  });
  
  // Get vehicle by ID
  app.get(`${prefix}/vehicles/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      const vehicleId = parseInt(id);
      
      if (isNaN(vehicleId)) {
        return res.status(400).json({ message: "Invalid vehicle ID" });
      }
      
      const vehicle = await storage.getVehicleById(vehicleId);
      
      if (!vehicle) {
        return res.status(404).json({ message: "Vehicle not found" });
      }
      
      res.json(vehicle);
    } catch (error) {
      console.error("Error fetching vehicle:", error);
      res.status(500).json({ message: "Error fetching vehicle" });
    }
  });
  
  // Create a new vehicle
  app.post(`${prefix}/vehicles`, async (req, res) => {
    try {
      const validatedData = insertVehicleSchema.parse(req.body);
      const vehicle = await storage.createVehicle(validatedData);
      res.status(201).json(vehicle);
    } catch (error) {
      console.error("Error creating vehicle:", error);
      res.status(400).json({ message: "Invalid vehicle data" });
    }
  });
  
  // Update a vehicle
  app.put(`${prefix}/vehicles/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      const vehicleId = parseInt(id);
      
      if (isNaN(vehicleId)) {
        return res.status(400).json({ message: "Invalid vehicle ID" });
      }
      
      const validatedData = insertVehicleSchema.parse(req.body);
      const updatedVehicle = await storage.updateVehicle(vehicleId, validatedData);
      
      if (!updatedVehicle) {
        return res.status(404).json({ message: "Vehicle not found" });
      }
      
      res.json(updatedVehicle);
    } catch (error) {
      console.error("Error updating vehicle:", error);
      res.status(400).json({ message: "Invalid vehicle data" });
    }
  });
  
  // Delete a vehicle
  app.delete(`${prefix}/vehicles/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      const vehicleId = parseInt(id);
      
      if (isNaN(vehicleId)) {
        return res.status(400).json({ message: "Invalid vehicle ID" });
      }
      
      const deleted = await storage.deleteVehicle(vehicleId);
      
      if (!deleted) {
        return res.status(404).json({ message: "Vehicle not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting vehicle:", error);
      res.status(500).json({ message: "Error deleting vehicle" });
    }
  });
}
