import { Request, Response } from 'express';
import type { Express } from 'express';
import { IStorage } from '../storage';

/**
 * Registra las rutas relacionadas con la analítica
 * @param app Instancia de Express
 * @param prefix Prefijo de la ruta de API
 * @param storage Interfaz de almacenamiento
 */
export function registerAnalyticsRoutes(app: Express, prefix: string, storage: IStorage) {
  // Obtener datos de compatibilidad para el dashboard
  app.get(`${prefix}/analytics/compatibility`, async (req: Request, res: Response) => {
    try {
      const { timeRange = 'month' } = req.query;
      
      // Datos de compatibilidad por marca
      const makeData = await storage.getCompatibilityAnalyticsByMake(timeRange as string);
      
      // Datos de compatibilidad por año de vehículo
      const yearData = await storage.getCompatibilityAnalyticsByYear(timeRange as string);
      
      // Datos de compatibilidad por categoría de producto
      const categoryData = await storage.getCompatibilityAnalyticsByCategory(timeRange as string);
      
      // Tendencias de compatibilidad a lo largo del tiempo
      const trendsData = await storage.getCompatibilityTrends(timeRange as string);
      
      res.json({
        makeData,
        yearData,
        categoryData,
        trendsData
      });
    } catch (error) {
      console.error('Error al obtener datos de compatibilidad:', error);
      res.status(500).json({ message: 'Error al obtener datos de compatibilidad' });
    }
  });
  
  // Obtener datos analíticos de productos para el dashboard
  app.get(`${prefix}/analytics/products`, async (req: Request, res: Response) => {
    try {
      const { timeRange = 'month' } = req.query;
      
      // Productos más compatibles
      const topProducts = await storage.getTopCompatibleProducts(timeRange as string);
      
      // Distribución de productos por categoría
      const categoryDistribution = await storage.getProductCategoryDistribution(timeRange as string);
      
      // Productos más vistos
      const mostViewed = await storage.getMostViewedProducts(timeRange as string);
      
      // Productos más buscados
      const mostSearched = await storage.getMostSearchedProducts(timeRange as string);
      
      res.json({
        topProducts,
        categoryDistribution,
        mostViewed,
        mostSearched
      });
    } catch (error) {
      console.error('Error al obtener datos de productos:', error);
      res.status(500).json({ message: 'Error al obtener datos de productos' });
    }
  });
  
  // Obtener datos analíticos de vehículos para el dashboard
  app.get(`${prefix}/analytics/vehicles`, async (req: Request, res: Response) => {
    try {
      const { timeRange = 'month' } = req.query;
      
      // Distribución de vehículos por marca
      const makeDistribution = await storage.getVehicleMakeDistribution(timeRange as string);
      
      // Distribución de vehículos por año
      const yearDistribution = await storage.getVehicleYearDistribution(timeRange as string);
      
      // Vehículos más compatibles (con más productos)
      const mostCompatible = await storage.getMostCompatibleVehicles(timeRange as string);
      
      // Vehículos más buscados
      const mostSearched = await storage.getMostSearchedVehicles(timeRange as string);
      
      res.json({
        makeDistribution,
        yearDistribution,
        mostCompatible,
        mostSearched
      });
    } catch (error) {
      console.error('Error al obtener datos de vehículos:', error);
      res.status(500).json({ message: 'Error al obtener datos de vehículos' });
    }
  });
  
  // Obtener resumen general para el dashboard
  app.get(`${prefix}/analytics/summary`, async (req: Request, res: Response) => {
    try {
      // Datos generales para tarjetas de resumen
      const totalProducts = await storage.getTotalProducts();
      const totalVehicles = await storage.getTotalVehicles();
      const totalCompatibilityRecords = await storage.getTotalCompatibilityRecords();
      const averageProductsPerVehicle = await storage.getAverageProductsPerVehicle();
      
      res.json({
        totalProducts,
        totalVehicles,
        totalCompatibilityRecords,
        averageProductsPerVehicle
      });
    } catch (error) {
      console.error('Error al obtener resumen de analítica:', error);
      res.status(500).json({ message: 'Error al obtener resumen de analítica' });
    }
  });
}