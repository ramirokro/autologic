import { Express } from "express";
import { IStorage } from "../storage";
import { 
  Product, 
  insertProductSchema, 
  products, 
  compatibility, 
  vehicles 
} from "@shared/schema";

/**
 * Registers product-related routes
 * @param app Express app instance
 * @param prefix API route prefix
 * @param storage Storage interface
 */
export function registerProductRoutes(app: Express, prefix: string, storage: IStorage) {
  
  // Get all products with optional filters
  app.get(`${prefix}/products`, async (req, res) => {
    try {
      const {
        page = "1",
        limit = "12",
        sort = "relevance",
        year,
        make,
        model,
        engine,
        category,
        brand,
        min_price,
        max_price,
        availability
      } = req.query;
      
      // Parse pagination
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const offset = (pageNum - 1) * limitNum;
      
      // Build filter criteria
      const filters: any = {};
      
      if (category) {
        filters.category = Array.isArray(category) ? category : [category as string];
      }
      
      if (brand) {
        filters.brand = Array.isArray(brand) ? brand : [brand as string];
      }
      
      if (min_price) {
        filters.minPrice = parseFloat(min_price as string);
      }
      
      if (max_price) {
        filters.maxPrice = parseFloat(max_price as string);
      }
      
      if (availability === 'instock') {
        filters.inStock = true;
      } else if (availability === 'backorder') {
        filters.inStock = false;
      }
      
      // Vehicle compatibility filter
      if (year && make && model) {
        filters.vehicle = {
          year: parseInt(year as string),
          make: make as string,
          model: model as string,
          engine: engine as string || undefined
        };
      }
      
      // Sorting
      let sortField = "id";
      let sortOrder = "asc";
      
      switch (sort) {
        case "price_asc":
          sortField = "price";
          sortOrder = "asc";
          break;
        case "price_desc":
          sortField = "price";
          sortOrder = "desc";
          break;
        case "bestsellers":
          sortField = "popularity";
          sortOrder = "desc";
          break;
        case "relevance":
        default:
          sortField = "id";
          sortOrder = "desc";
          break;
      }
      
      const result = await storage.getProducts({
        offset,
        limit: limitNum,
        filters,
        sortField,
        sortOrder
      });
      
      res.json({
        products: result.products,
        total: result.total,
        page: pageNum,
        totalPages: Math.ceil(result.total / limitNum)
      });
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Error fetching products" });
    }
  });
  
  // Get featured products
  app.get(`${prefix}/products/featured`, async (req, res) => {
    try {
      const featuredProducts = await storage.getFeaturedProducts();
      res.json(featuredProducts);
    } catch (error) {
      console.error("Error fetching featured products:", error);
      res.status(500).json({ message: "Error fetching featured products" });
    }
  });
  
  // Get products compatible with a specific vehicle
  app.get(`${prefix}/products/compatible`, async (req, res) => {
    try {
      const { vehicleId } = req.query;
      
      if (!vehicleId) {
        return res.status(400).json({ message: "Vehicle ID is required" });
      }
      
      const vehicleIdNum = parseInt(vehicleId as string);
      const compatibleProducts = await storage.getCompatibleProducts(vehicleIdNum);
      
      res.json(compatibleProducts);
    } catch (error) {
      console.error("Error fetching compatible products:", error);
      res.status(500).json({ message: "Error fetching compatible products" });
    }
  });
  
  // Get product by ID including compatibility information
  app.get(`${prefix}/products/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      const productId = parseInt(id);
      
      if (isNaN(productId)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      
      const product = await storage.getProductById(productId);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      const compatibleVehicles = await storage.getCompatibleVehicles(productId);
      
      res.json({
        product,
        compatibleVehicles
      });
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Error fetching product" });
    }
  });
  
  // Get related products
  app.get(`${prefix}/products/:id/related`, async (req, res) => {
    try {
      const { id } = req.params;
      const productId = parseInt(id);
      
      if (isNaN(productId)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      
      const relatedProducts = await storage.getRelatedProducts(productId);
      res.json(relatedProducts);
    } catch (error) {
      console.error("Error fetching related products:", error);
      res.status(500).json({ message: "Error fetching related products" });
    }
  });
  
  // Create a new product
  app.post(`${prefix}/products`, async (req, res) => {
    try {
      const validatedData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(validatedData);
      res.status(201).json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(400).json({ message: "Invalid product data" });
    }
  });
  
  // Update a product
  app.put(`${prefix}/products/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      const productId = parseInt(id);
      
      if (isNaN(productId)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      
      const validatedData = insertProductSchema.parse(req.body);
      const updatedProduct = await storage.updateProduct(productId, validatedData);
      
      if (!updatedProduct) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(updatedProduct);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(400).json({ message: "Invalid product data" });
    }
  });
  
  // Delete a product
  app.delete(`${prefix}/products/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      const productId = parseInt(id);
      
      if (isNaN(productId)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      
      const deleted = await storage.deleteProduct(productId);
      
      if (!deleted) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ message: "Error deleting product" });
    }
  });
  
  // Get popular categories
  app.get(`${prefix}/categories/popular`, async (req, res) => {
    try {
      const categories = await storage.getPopularCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching popular categories:", error);
      res.status(500).json({ message: "Error fetching popular categories" });
    }
  });
  
  // Get all categories with count
  app.get(`${prefix}/categories`, async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Error fetching categories" });
    }
  });
  
  // Get popular brands
  app.get(`${prefix}/brands/popular`, async (req, res) => {
    try {
      const brands = await storage.getPopularBrands();
      res.json(brands);
    } catch (error) {
      console.error("Error fetching popular brands:", error);
      res.status(500).json({ message: "Error fetching popular brands" });
    }
  });
  
  // Get all brands with count
  app.get(`${prefix}/brands`, async (req, res) => {
    try {
      const brands = await storage.getBrands();
      res.json(brands);
    } catch (error) {
      console.error("Error fetching brands:", error);
      res.status(500).json({ message: "Error fetching brands" });
    }
  });
  
  // Get multiple products by ID for comparison
  app.post(`${prefix}/products/compare`, async (req, res) => {
    try {
      const { productIds } = req.body;
      
      if (!Array.isArray(productIds) || productIds.length === 0) {
        return res.status(400).json({ message: "Product IDs array is required" });
      }
      
      if (productIds.length > 4) {
        return res.status(400).json({ message: "Maximum of 4 products can be compared at once" });
      }
      
      const productPromises = productIds.map(id => storage.getProductById(id));
      const products = await Promise.all(productPromises);
      
      // Filter out any null values (products not found)
      const validProducts = products.filter(p => p !== undefined);
      
      res.json(validProducts);
    } catch (error) {
      console.error("Error fetching products for comparison:", error);
      res.status(500).json({ message: "Error fetching products for comparison" });
    }
  });
}
