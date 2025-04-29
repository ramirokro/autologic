import { Router } from 'express';
import { 
  buscarProductos, 
  buscarProductosPorRefaccion, 
  generarUrlCheckoutDirecto,
  generarUrlCheckoutMultiple
} from '../services/shopify';

export function registerShopifyRoutes(app: any, apiPrefix: string) {
  const router = Router();

  /**
   * Buscar productos en Shopify
   * POST /api/shopify/buscar
   * Body: { query: string }
   */
  router.post('/buscar', async (req, res) => {
    try {
      // Usar un string vacío si no hay query, para obtener todos los productos disponibles
      const query = req.body.query ?? '';
      
      // Buscar productos, un query vacío retornará todos los productos disponibles
      const productos = await buscarProductos(query);
      
      return res.json({
        success: true,
        productos
      });
    } catch (error: any) {
      console.error('Error al buscar productos en Shopify:', error);
      return res.status(500).json({
        success: false,
        error: 'Error al buscar productos',
        details: error.message
      });
    }
  });

  /**
   * Buscar productos por refacción específica
   * POST /api/shopify/refaccion
   * Body: { refaccion: string, marca?: string, modelo?: string, anio?: number }
   */
  router.post('/refaccion', async (req, res) => {
    try {
      const { refaccion, marca, modelo, anio } = req.body;
      
      if (!refaccion) {
        return res.status(400).json({
          success: false,
          error: 'Es necesario proporcionar el nombre de la refacción'
        });
      }
      
      // Registramos los parámetros de búsqueda para diagnóstico
      console.log(`Buscando refacción: "${refaccion}" para ${marca || 'cualquier marca'} ${modelo || 'cualquier modelo'} ${anio || 'cualquier año'}`);
      
      const productos = await buscarProductosPorRefaccion(refaccion, marca, modelo, anio);
      
      console.log(`Resultados encontrados: ${productos.length} productos`);
      
      return res.json({
        success: true,
        productos
      });
    } catch (error: any) {
      console.error('Error al buscar refacciones en Shopify:', error);
      return res.status(500).json({
        success: false,
        error: 'Error al buscar refacciones',
        details: error.message
      });
    }
  });

  /**
   * Generar URL de checkout directo para un producto
   * POST /api/shopify/checkout-directo
   * Body: { variantId: string, quantity?: number }
   */
  router.post('/checkout-directo', (req, res) => {
    try {
      const { variantId, quantity = 1 } = req.body;
      
      if (!variantId) {
        return res.status(400).json({
          success: false,
          error: 'Es necesario proporcionar el ID de variante del producto'
        });
      }
      
      const url = generarUrlCheckoutDirecto(variantId, quantity);
      
      return res.json({
        success: true,
        url
      });
    } catch (error: any) {
      console.error('Error al generar URL de checkout directo:', error);
      return res.status(500).json({
        success: false,
        error: 'Error al generar URL de checkout',
        details: error.message
      });
    }
  });
  
  /**
   * Generar URL de checkout para múltiples productos
   * POST /api/shopify/checkout-multiple
   * Body: { items: Array<{variantId: string, quantity: number}> }
   */
  router.post('/checkout-multiple', (req, res) => {
    try {
      const { items } = req.body;
      
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Es necesario proporcionar una lista de productos'
        });
      }
      
      // Validar que todos los items tengan variantId
      const itemsValidos = items.every(item => !!item.variantId);
      if (!itemsValidos) {
        return res.status(400).json({
          success: false,
          error: 'Todos los productos deben tener un ID de variante'
        });
      }
      
      const url = generarUrlCheckoutMultiple(items);
      
      return res.json({
        success: true,
        url
      });
    } catch (error: any) {
      console.error('Error al generar URL de checkout múltiple:', error);
      return res.status(500).json({
        success: false,
        error: 'Error al generar URL de checkout',
        details: error.message
      });
    }
  });
  
  /**
   * Redirección directa al checkout para un producto
   * GET /api/shopify/checkout-directo-link/:variantId
   * Parámetros de query: quantity (opcional)
   */
  router.get('/checkout-directo-link/:variantId', (req, res) => {
    try {
      const { variantId } = req.params;
      const quantity = parseInt(req.query.quantity as string) || 1;
      
      if (!variantId) {
        return res.status(400).send('ID de producto no proporcionado');
      }
      
      // Genera la URL y redirige directamente
      const url = generarUrlCheckoutDirecto(variantId, quantity);
      
      // Registrar para análisis
      console.log(`Redirección al checkout: variantId=${variantId}, quantity=${quantity}`);
      
      // Redirección directa a Shopify
      return res.redirect(url);
    } catch (error: any) {
      console.error('Error en la redirección al checkout:', error);
      
      // En caso de error, redirigir al carrito general
      return res.redirect('https://autologic.mx/cart');
    }
  });

  // Registrar las rutas
  app.use(`${apiPrefix}/shopify`, router);
}