import { Express } from "express";
import { IStorage } from "../storage";
import { insertCompatibilitySchema, Compatibility } from "@shared/schema";

/**
 * Registers compatibility-related routes
 * @param app Express app instance
 * @param prefix API route prefix
 * @param storage Storage interface
 */
export function registerCompatibilityRoutes(app: Express, prefix: string, storage: IStorage) {
  
  // Get all compatibility records with optional filters
  app.get(`${prefix}/compatibility`, async (req, res) => {
    try {
      const { productId, vehicleId } = req.query;
      const filters: Partial<Compatibility> = {};
      
      if (productId) {
        filters.productId = parseInt(productId as string);
      }
      
      if (vehicleId) {
        filters.vehicleId = parseInt(vehicleId as string);
      }
      
      const compatibilityRecords = await storage.getCompatibilityRecords(filters);
      res.json(compatibilityRecords);
    } catch (error) {
      console.error("Error fetching compatibility records:", error);
      res.status(500).json({ message: "Error fetching compatibility records" });
    }
  });
  
  // Get compatibility record by ID
  app.get(`${prefix}/compatibility/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      const recordId = parseInt(id);
      
      if (isNaN(recordId)) {
        return res.status(400).json({ message: "Invalid compatibility record ID" });
      }
      
      const compatibilityRecord = await storage.getCompatibilityById(recordId);
      
      if (!compatibilityRecord) {
        return res.status(404).json({ message: "Compatibility record not found" });
      }
      
      res.json(compatibilityRecord);
    } catch (error) {
      console.error("Error fetching compatibility record:", error);
      res.status(500).json({ message: "Error fetching compatibility record" });
    }
  });
  
  // Create a new compatibility record
  app.post(`${prefix}/compatibility`, async (req, res) => {
    try {
      const validatedData = insertCompatibilitySchema.parse(req.body);
      
      // Check if the product exists
      const product = await storage.getProductById(validatedData.productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      // Check if the vehicle exists
      const vehicle = await storage.getVehicleById(validatedData.vehicleId);
      if (!vehicle) {
        return res.status(404).json({ message: "Vehicle not found" });
      }
      
      // Check if the compatibility record already exists
      const existing = await storage.getCompatibilityRecords({
        productId: validatedData.productId,
        vehicleId: validatedData.vehicleId
      });
      
      if (existing.length > 0) {
        return res.status(409).json({ message: "Compatibility record already exists" });
      }
      
      const compatibilityRecord = await storage.createCompatibility(validatedData);
      res.status(201).json(compatibilityRecord);
    } catch (error) {
      console.error("Error creating compatibility record:", error);
      res.status(400).json({ message: "Invalid compatibility record data" });
    }
  });
  
  // Update a compatibility record
  app.put(`${prefix}/compatibility/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      const recordId = parseInt(id);
      
      if (isNaN(recordId)) {
        return res.status(400).json({ message: "Invalid compatibility record ID" });
      }
      
      const validatedData = insertCompatibilitySchema.parse(req.body);
      
      // Check if the product exists
      const product = await storage.getProductById(validatedData.productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      // Check if the vehicle exists
      const vehicle = await storage.getVehicleById(validatedData.vehicleId);
      if (!vehicle) {
        return res.status(404).json({ message: "Vehicle not found" });
      }
      
      const updatedRecord = await storage.updateCompatibility(recordId, validatedData);
      
      if (!updatedRecord) {
        return res.status(404).json({ message: "Compatibility record not found" });
      }
      
      res.json(updatedRecord);
    } catch (error) {
      console.error("Error updating compatibility record:", error);
      res.status(400).json({ message: "Invalid compatibility record data" });
    }
  });
  
  // Delete a compatibility record
  app.delete(`${prefix}/compatibility/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      const recordId = parseInt(id);
      
      if (isNaN(recordId)) {
        return res.status(400).json({ message: "Invalid compatibility record ID" });
      }
      
      const deleted = await storage.deleteCompatibility(recordId);
      
      if (!deleted) {
        return res.status(404).json({ message: "Compatibility record not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting compatibility record:", error);
      res.status(500).json({ message: "Error deleting compatibility record" });
    }
  });
  
  // Batch create compatibility records
  app.post(`${prefix}/compatibility/batch`, async (req, res) => {
    try {
      const { records } = req.body;
      
      if (!Array.isArray(records) || records.length === 0) {
        return res.status(400).json({ message: "Records must be a non-empty array" });
      }
      
      const results = await storage.createCompatibilityBatch(records);
      res.status(201).json(results);
    } catch (error) {
      console.error("Error creating batch compatibility records:", error);
      res.status(400).json({ message: "Invalid compatibility batch data" });
    }
  });
  
  // Check if a product is compatible with a specific vehicle
  app.get(`${prefix}/compatibility/check`, async (req, res) => {
    try {
      const { productId, vehicleId } = req.query;
      
      if (!productId || !vehicleId) {
        return res.status(400).json({ message: "Product ID and Vehicle ID are required" });
      }
      
      const productIdNum = parseInt(productId as string);
      const vehicleIdNum = parseInt(vehicleId as string);
      
      const isCompatible = await storage.checkCompatibility(productIdNum, vehicleIdNum);
      
      res.json({ compatible: isCompatible });
    } catch (error) {
      console.error("Error checking compatibility:", error);
      res.status(500).json({ message: "Error checking compatibility" });
    }
  });
}
