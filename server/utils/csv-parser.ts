import fs from 'fs';
import { createReadStream } from 'fs';
import { parse } from 'csv-parse';
import { InsertVehicle, InsertProduct, InsertCompatibility } from '@shared/schema';
import { resolve } from 'path';

/**
 * Interface for CSV import options
 */
interface CSVImportOptions {
  updateExisting?: boolean;
  deleteExisting?: boolean;
  validateAces?: boolean;
  sendNotification?: boolean;
}

/**
 * Interface for generic CSV import results
 */
interface ImportResult {
  imported: number;
  updated: number;
  errors: Array<{
    row: number;
    message: string;
  }>;
}

/**
 * Interface for compatibility import results
 */
interface CompatibilityImportResult extends ImportResult {
  deleted: number;
}

/**
 * Parses a CSV file containing product data (PIES)
 * @param filePath Path to the CSV file
 * @param options Import options
 * @returns Promise with import results
 */
export async function parseProductsCSV(filePath: string, options: CSVImportOptions = {}): Promise<ImportResult> {
  return new Promise((resolve, reject) => {
    const products: InsertProduct[] = [];
    const errors: Array<{ row: number; message: string }> = [];
    let rowCounter = 0;
    
    createReadStream(filePath)
      .pipe(parse({
        columns: true,
        skip_empty_lines: true,
        trim: true
      }))
      .on('data', (row) => {
        rowCounter++;
        try {
          // Map CSV columns to product properties
          const product: InsertProduct = {
            sku: row.sku || row.SKU || row.partNumber || row.part_number,
            title: row.title || row.name || row.productName || row.product_name,
            description: row.description || row.desc || row.productDescription || row.product_description,
            price: parseFloat(row.price || row.msrp || "0"),
            brand: row.brand || row.manufacturer || row.brandName || row.brand_name,
            category: row.category || row.productType || row.product_type,
            stock: parseInt(row.stock || row.quantity || row.inventoryCount || row.inventory_count || "0"),
            inStock: (row.inStock || row.in_stock || row.available || "true").toLowerCase() === "true",
            images: parseImages(row.images || row.image || row.productImages || row.product_images || "")
          };
          
          products.push(product);
        } catch (error) {
          errors.push({
            row: rowCounter,
            message: error instanceof Error ? error.message : "Unknown error"
          });
        }
      })
      .on('end', () => {
        resolve({
          imported: products.length,
          updated: 0, // This would be calculated after DB operations
          errors
        });
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}

/**
 * Parses a CSV file containing vehicle data (ACES)
 * @param filePath Path to the CSV file
 * @param options Import options
 * @returns Promise with import results
 */
export async function parseVehiclesCSV(filePath: string, options: CSVImportOptions = {}): Promise<ImportResult> {
  return new Promise((resolve, reject) => {
    const vehicles: InsertVehicle[] = [];
    const errors: Array<{ row: number; message: string }> = [];
    let rowCounter = 0;
    
    createReadStream(filePath)
      .pipe(parse({
        columns: true,
        skip_empty_lines: true,
        trim: true
      }))
      .on('data', (row) => {
        rowCounter++;
        try {
          // Map CSV columns to vehicle properties
          const vehicle: InsertVehicle = {
            year: parseInt(row.year || row.modelYear || row.model_year),
            make: row.make || row.manufacturer,
            model: row.model || row.vehicleModel || row.vehicle_model,
            submodel: row.submodel || row.trim || row.sub_model || "",
            engine: row.engine || row.engineCode || row.engine_code || ""
          };
          
          // Validate ACES if needed
          if (options.validateAces) {
            validateVehicleData(vehicle);
          }
          
          vehicles.push(vehicle);
        } catch (error) {
          errors.push({
            row: rowCounter,
            message: error instanceof Error ? error.message : "Unknown error"
          });
        }
      })
      .on('end', () => {
        resolve({
          imported: vehicles.length,
          updated: 0, // This would be calculated after DB operations
          errors
        });
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}

/**
 * Parses a CSV file containing compatibility data (ACES mapping)
 * @param filePath Path to the CSV file
 * @param options Import options
 * @returns Promise with import results
 */
export async function parseCompatibilityCSV(filePath: string, options: CSVImportOptions = {}): Promise<CompatibilityImportResult> {
  return new Promise((resolve, reject) => {
    const compatibilities: Array<{ 
      productSku: string; 
      year: number; 
      make: string; 
      model: string; 
      submodel?: string; 
      engine?: string;
      notes?: string;
    }> = [];
    const errors: Array<{ row: number; message: string }> = [];
    let rowCounter = 0;
    
    createReadStream(filePath)
      .pipe(parse({
        columns: true,
        skip_empty_lines: true,
        trim: true
      }))
      .on('data', (row) => {
        rowCounter++;
        try {
          // Map CSV columns to compatibility properties
          const compatibility = {
            productSku: row.sku || row.partNumber || row.part_number || row.product_sku,
            year: parseInt(row.year || row.modelYear || row.model_year),
            make: row.make || row.manufacturer,
            model: row.model || row.vehicleModel || row.vehicle_model,
            submodel: row.submodel || row.trim || row.sub_model || "",
            engine: row.engine || row.engineCode || row.engine_code || "",
            notes: row.notes || row.comments || row.fitmentNotes || row.fitment_notes || ""
          };
          
          // Validate required fields
          if (!compatibility.productSku || !compatibility.year || !compatibility.make || !compatibility.model) {
            throw new Error("Missing required fields: SKU, year, make, and model are required");
          }
          
          compatibilities.push(compatibility);
        } catch (error) {
          errors.push({
            row: rowCounter,
            message: error instanceof Error ? error.message : "Unknown error"
          });
        }
      })
      .on('end', () => {
        resolve({
          imported: compatibilities.length,
          updated: 0, // This would be calculated after DB operations
          deleted: options.deleteExisting ? 0 : 0, // This would be calculated after DB operations
          errors
        });
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}

/**
 * Validates vehicle data against ACES standards
 * This is a simplified validation that would be expanded in a real implementation
 * @param vehicle Vehicle data to validate
 */
function validateVehicleData(vehicle: InsertVehicle): void {
  // Year validation
  if (vehicle.year < 1900 || vehicle.year > new Date().getFullYear() + 1) {
    throw new Error(`Invalid year: ${vehicle.year}`);
  }
  
  // Make validation (simplified)
  if (!vehicle.make || vehicle.make.length < 2) {
    throw new Error(`Invalid make: ${vehicle.make}`);
  }
  
  // Model validation (simplified)
  if (!vehicle.model || vehicle.model.length < 1) {
    throw new Error(`Invalid model: ${vehicle.model}`);
  }
}

/**
 * Parses an image string into an array of image URLs
 * @param imageString Comma-separated string of image URLs
 * @returns Array of image URLs
 */
function parseImages(imageString: string): string[] {
  if (!imageString || imageString.trim() === '') {
    return [];
  }
  
  return imageString
    .split(',')
    .map(url => url.trim())
    .filter(url => url.length > 0);
}

/**
 * Checks if a file exists and is accessible
 * @param filePath Path to the file
 * @returns Promise that resolves to true if file exists and is accessible
 */
export async function fileExists(filePath: string): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    fs.access(filePath, fs.constants.F_OK, (err) => {
      resolve(!err);
    });
  });
}

/**
 * Deletes a file
 * @param filePath Path to the file
 * @returns Promise that resolves when file is deleted
 */
export async function deleteFile(filePath: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    fs.unlink(filePath, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}
