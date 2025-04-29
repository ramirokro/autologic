import type { Express, Request, Response } from "express";
import type { IStorage } from "../storage";
import { z } from "zod";

/**
 * Registers video tutorial related routes
 * @param app Express app instance
 * @param prefix API route prefix
 * @param storage Storage interface
 */
export function registerVideoRoutes(app: Express, prefix: string, storage: IStorage) {
  // Order matters: We need to place specific routes before generic ones with path parameters
  // Get video categories - DEBE IR ANTES QUE LAS RUTAS CON PARÁMETROS
  app.get(`${prefix}/videos/categories`, async (req: Request, res: Response) => {
    try {
      // Obtenemos todos los videos y extraemos las categorías únicas
      const result = await storage.getVideoTutorials({
        offset: 0,
        limit: 100, // Límite alto para obtener la mayoría de videos
        filters: {},
        sortField: 'createdAt',
        sortOrder: 'desc'
      });
      
      // Extraer categorías únicas
      const categories = [...new Set(result.videos.map(video => video.category))];
      return res.json(categories);
    } catch (error) {
      console.error("Error fetching video categories:", error);
      return res.status(500).json({ error: "Error fetching video categories" });
    }
  });

  // Get popular video tutorials - DEBE IR ANTES QUE LAS RUTAS CON PARÁMETROS
  app.get(`${prefix}/videos/popular`, async (req: Request, res: Response) => {
    try {
      const popularVideos = await storage.getPopularVideoTutorials();
      return res.json(popularVideos);
    } catch (error) {
      console.error("Error fetching popular video tutorials:", error);
      return res.status(500).json({ error: "Error fetching popular video tutorials" });
    }
  });
  
  // Get all video tutorials with filtering and pagination
  app.get(`${prefix}/videos`, async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = (page - 1) * limit;
      
      // Parse filters
      const category = req.query.category as string | undefined;
      const difficultyLevel = req.query.difficultyLevel as string | undefined;
      const vehicleId = req.query.vehicleId ? parseInt(req.query.vehicleId as string) : undefined;
      const productId = req.query.productId ? parseInt(req.query.productId as string) : undefined;
      const tags = req.query.tags ? (req.query.tags as string).split(',') : undefined;
      
      // Parse sorting
      const sortField = req.query.sortField as string || 'createdAt';
      const sortOrder = req.query.sortOrder as string || 'desc';
      
      const result = await storage.getVideoTutorials({
        offset,
        limit,
        filters: {
          category,
          difficultyLevel,
          vehicleId,
          productId,
          tags
        },
        sortField,
        sortOrder
      });
      
      return res.json(result);
    } catch (error) {
      console.error("Error fetching video tutorials:", error);
      return res.status(500).json({ error: "Error fetching video tutorials" });
    }
  });
  
  // Get a specific video tutorial by ID
  app.get(`${prefix}/videos/:id`, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid video ID" });
      }
      
      const videoDetails = await storage.getVideoTutorialDetails(id);
      
      if (!videoDetails) {
        return res.status(404).json({ error: "Video tutorial not found" });
      }
      
      return res.json(videoDetails);
    } catch (error) {
      console.error("Error fetching video tutorial details:", error);
      return res.status(500).json({ error: "Error fetching video tutorial details" });
    }
  });
  
  // Get video tutorials for a specific vehicle
  app.get(`${prefix}/vehicles/:vehicleId/videos`, async (req: Request, res: Response) => {
    try {
      const vehicleId = parseInt(req.params.vehicleId);
      
      if (isNaN(vehicleId)) {
        return res.status(400).json({ error: "Invalid vehicle ID" });
      }
      
      const videos = await storage.getVideoTutorialsForVehicle(vehicleId);
      return res.json(videos);
    } catch (error) {
      console.error("Error fetching vehicle video tutorials:", error);
      return res.status(500).json({ error: "Error fetching vehicle video tutorials" });
    }
  });
  
  // Get video tutorials for a specific product
  app.get(`${prefix}/products/:productId/videos`, async (req: Request, res: Response) => {
    try {
      const productId = parseInt(req.params.productId);
      
      if (isNaN(productId)) {
        return res.status(400).json({ error: "Invalid product ID" });
      }
      
      const videos = await storage.getVideoTutorialsForProduct(productId);
      return res.json(videos);
    } catch (error) {
      console.error("Error fetching product video tutorials:", error);
      return res.status(500).json({ error: "Error fetching product video tutorials" });
    }
  });
  
  // Get related video tutorials
  app.get(`${prefix}/videos/:videoId/related`, async (req: Request, res: Response) => {
    try {
      const videoId = parseInt(req.params.videoId);
      
      if (isNaN(videoId)) {
        return res.status(400).json({ error: "Invalid video ID" });
      }
      
      const relatedVideos = await storage.getRelatedVideoTutorials(videoId);
      return res.json(relatedVideos);
    } catch (error) {
      console.error("Error fetching related video tutorials:", error);
      return res.status(500).json({ error: "Error fetching related video tutorials" });
    }
  });
  
  // Create a new video tutorial (admin only)
  app.post(`${prefix}/videos`, async (req: Request, res: Response) => {
    try {
      const videoData = req.body;
      
      const videoSchema = z.object({
        title: z.string().min(5, "Title must be at least 5 characters long"),
        description: z.string().min(20, "Description must be at least 20 characters long"),
        videoUrl: z.string().url("Video URL must be a valid URL"),
        thumbnailUrl: z.string().url("Thumbnail URL must be a valid URL"),
        duration: z.number().min(1, "Duration must be at least 1 second"),
        difficultyLevel: z.enum(["beginner", "intermediate", "advanced"]),
        category: z.string(),
        tags: z.array(z.string()).default([])
      });
      
      const validatedData = videoSchema.parse(videoData);
      const newVideo = await storage.createVideoTutorial(validatedData);
      
      return res.status(201).json(newVideo);
    } catch (error) {
      console.error("Error creating video tutorial:", error);
      return res.status(400).json({ error: "Error creating video tutorial", details: error.errors || error.message });
    }
  });

  // Create video compatibility record (admin only)
  app.post(`${prefix}/videos/compatibility`, async (req: Request, res: Response) => {
    try {
      const compatData = req.body;
      
      const compatSchema = z.object({
        videoId: z.number(),
        vehicleId: z.number().optional(),
        productId: z.number().optional(),
        relevanceScore: z.number().min(1).max(10).default(5)
      }).refine(data => data.vehicleId !== undefined || data.productId !== undefined, {
        message: "Either vehicleId or productId must be provided"
      });
      
      const validatedData = compatSchema.parse(compatData);
      const newCompatRecord = await storage.createVideoCompatibility(validatedData);
      
      return res.status(201).json(newCompatRecord);
    } catch (error) {
      console.error("Error creating video compatibility record:", error);
      return res.status(400).json({ error: "Error creating video compatibility record", details: error.errors || error.message });
    }
  });
}