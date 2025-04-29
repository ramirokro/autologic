import { Express, Request, Response } from "express";
import { IStorage } from "../storage";
import { z } from "zod";

/**
 * Registra las rutas relacionadas con los tutoriales en video
 * @param app Instancia de Express
 * @param prefix Prefijo de la ruta de API
 * @param storage Interfaz de almacenamiento
 */
export function registerVideoTutorialRoutes(app: Express, prefix: string, storage: IStorage) {
  // Obtener todos los tutoriales en video con filtros, ordenamiento y paginación
  app.get(`${prefix}/videos`, async (req: Request, res: Response) => {
    try {
      const offset = parseInt(req.query.offset as string) || 0;
      const limit = parseInt(req.query.limit as string) || 10;
      const sortField = (req.query.sortField as string) || 'createdAt';
      const sortOrder = (req.query.sortOrder as string) || 'desc';
      
      // Parsear filtros
      const filters: any = {};
      
      if (req.query.category) {
        filters.category = req.query.category as string;
      }
      
      if (req.query.difficultyLevel) {
        filters.difficultyLevel = req.query.difficultyLevel as string;
      }
      
      if (req.query.tags) {
        const tagsParam = req.query.tags as string;
        filters.tags = tagsParam.split(',').map(tag => tag.trim());
      }
      
      if (req.query.vehicleId) {
        filters.vehicleId = parseInt(req.query.vehicleId as string);
      }
      
      if (req.query.productId) {
        filters.productId = parseInt(req.query.productId as string);
      }
      
      const result = await storage.getVideoTutorials({
        offset,
        limit,
        filters,
        sortField,
        sortOrder
      });
      
      res.json(result);
    } catch (error) {
      console.error('Error al obtener videos:', error);
      res.status(500).json({ error: 'Error al obtener los tutoriales en video' });
    }
  });
  
  // Obtener tutoriales destacados/populares
  app.get(`${prefix}/videos/popular`, async (req: Request, res: Response) => {
    try {
      const videos = await storage.getPopularVideoTutorials();
      res.json(videos);
    } catch (error: any) {
      console.error('Error al obtener videos populares:', error);
      res.status(500).json({ error: 'Error al obtener los tutoriales en video populares' });
    }
  });
  
  // Obtener videos relacionados a un video específico
  app.get(`${prefix}/videos/:id/related`, async (req: Request, res: Response) => {
    try {
      const videoId = parseInt(req.params.id);
      const videos = await storage.getRelatedVideoTutorials(videoId);
      res.json(videos);
    } catch (error: any) {
      console.error('Error al obtener videos relacionados:', error);
      res.status(500).json({ error: 'Error al obtener los tutoriales en video relacionados' });
    }
  });
  
  // Obtener detalles de un video específico
  app.get(`${prefix}/videos/:id`, async (req: Request, res: Response) => {
    try {
      const videoId = parseInt(req.params.id);
      const video = await storage.getVideoTutorialDetails(videoId);
      
      if (!video) {
        return res.status(404).json({ error: 'Tutorial en video no encontrado' });
      }
      
      res.json(video);
    } catch (error: any) {
      console.error('Error al obtener detalles del video:', error);
      res.status(500).json({ error: 'Error al obtener los detalles del tutorial en video' });
    }
  });
  
  // Obtener videos para un vehículo específico
  app.get(`${prefix}/vehicles/:id/videos`, async (req: Request, res: Response) => {
    try {
      const vehicleId = parseInt(req.params.id);
      const videos = await storage.getVideoTutorialsForVehicle(vehicleId);
      res.json(videos);
    } catch (error: any) {
      console.error('Error al obtener videos para vehículo:', error);
      res.status(500).json({ error: 'Error al obtener los tutoriales en video para este vehículo' });
    }
  });
  
  // Obtener videos para un producto específico
  app.get(`${prefix}/products/:id/videos`, async (req: Request, res: Response) => {
    try {
      const productId = parseInt(req.params.id);
      const videos = await storage.getVideoTutorialsForProduct(productId);
      res.json(videos);
    } catch (error) {
      console.error('Error al obtener videos para producto:', error);
      res.status(500).json({ error: 'Error al obtener los tutoriales en video para este producto' });
    }
  });
  
  // Crear un nuevo tutorial en video (para administradores)
  app.post(`${prefix}/videos`, async (req: Request, res: Response) => {
    try {
      // Validar datos de entrada
      const videoSchema = z.object({
        title: z.string().min(5),
        description: z.string().min(10),
        videoUrl: z.string().url(),
        thumbnailUrl: z.string().url(),
        duration: z.number().int().positive(),
        difficultyLevel: z.string(),
        category: z.string(),
        tags: z.array(z.string()).optional().default([])
      });
      
      const validatedData = videoSchema.parse(req.body);
      const newVideo = await storage.createVideoTutorial(validatedData);
      
      res.status(201).json(newVideo);
    } catch (error) {
      console.error('Error al crear video:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: 'Datos de entrada inválidos', details: error.errors });
      }
      res.status(500).json({ error: 'Error al crear el tutorial en video' });
    }
  });
  
  // Actualizar un video existente (para administradores)
  app.put(`${prefix}/videos/:id`, async (req: Request, res: Response) => {
    try {
      const videoId = parseInt(req.params.id);
      
      // Validar datos de entrada
      const videoSchema = z.object({
        title: z.string().min(5),
        description: z.string().min(10),
        videoUrl: z.string().url(),
        thumbnailUrl: z.string().url(),
        duration: z.number().int().positive(),
        difficultyLevel: z.string(),
        category: z.string(),
        tags: z.array(z.string()).optional().default([])
      });
      
      const validatedData = videoSchema.parse(req.body);
      const updatedVideo = await storage.updateVideoTutorial(videoId, validatedData);
      
      if (!updatedVideo) {
        return res.status(404).json({ error: 'Tutorial en video no encontrado' });
      }
      
      res.json(updatedVideo);
    } catch (error) {
      console.error('Error al actualizar video:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: 'Datos de entrada inválidos', details: error.errors });
      }
      res.status(500).json({ error: 'Error al actualizar el tutorial en video' });
    }
  });
  
  // Eliminar un video (para administradores)
  app.delete(`${prefix}/videos/:id`, async (req: Request, res: Response) => {
    try {
      const videoId = parseInt(req.params.id);
      const result = await storage.deleteVideoTutorial(videoId);
      
      if (!result) {
        return res.status(404).json({ error: 'Tutorial en video no encontrado' });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error('Error al eliminar video:', error);
      res.status(500).json({ error: 'Error al eliminar el tutorial en video' });
    }
  });
  
  // Crear una nueva relación de compatibilidad para un video
  app.post(`${prefix}/videos/:id/compatibility`, async (req: Request, res: Response) => {
    try {
      const videoId = parseInt(req.params.id);
      
      // Validar datos de entrada
      const compatSchema = z.object({
        productId: z.number().int().positive().optional(),
        vehicleId: z.number().int().positive().optional(),
        relevanceScore: z.number().int().min(1).max(10).optional()
      });
      
      // Se requiere al menos un productId o vehicleId
      if (!req.body.productId && !req.body.vehicleId) {
        return res.status(400).json({ error: 'Se requiere productId o vehicleId' });
      }
      
      const validatedData = compatSchema.parse(req.body);
      
      // Agregar videoId a los datos
      const compatRecord = {
        ...validatedData,
        videoId
      };
      
      const newCompat = await storage.createVideoCompatibility(compatRecord);
      
      res.status(201).json(newCompat);
    } catch (error) {
      console.error('Error al crear compatibilidad:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: 'Datos de entrada inválidos', details: error.errors });
      }
      res.status(500).json({ error: 'Error al crear la compatibilidad' });
    }
  });
  
  // Eliminar una relación de compatibilidad
  app.delete(`${prefix}/videos/compatibility/:id`, async (req: Request, res: Response) => {
    try {
      const compatId = parseInt(req.params.id);
      const result = await storage.deleteVideoCompatibility(compatId);
      
      if (!result) {
        return res.status(404).json({ error: 'Registro de compatibilidad no encontrado' });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error('Error al eliminar compatibilidad:', error);
      res.status(500).json({ error: 'Error al eliminar la compatibilidad' });
    }
  });
}