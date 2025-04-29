import { apiRequest } from '@/lib/queryClient';

/**
 * Interface para la estructura de productos
 */
export interface Producto {
  id: string;
  title: string;
  handle: string;
  description: string;
  image: string;
  imageAlt: string;
  price: string;
  variantId: string;
}

/**
 * Busca productos en Shopify
 * @param queryTexto Texto para buscar
 * @returns Lista de productos
 */
export async function buscarProductos(queryTexto: string): Promise<Producto[]> {
  try {
    const response = await apiRequest('POST', '/api/shopify/buscar', { query: queryTexto });
    const data = await response.json();
    
    if (data.success && data.productos) {
      return data.productos;
    }
    
    console.error('Error al buscar productos:', data.error || 'Respuesta inesperada');
    return [];
  } catch (error) {
    console.error('Error al buscar productos:', error);
    return [];
  }
}

/**
 * Busca productos por refacción y datos del vehículo
 * @param refaccion Nombre de la refacción
 * @param marca Marca del vehículo (opcional)
 * @param modelo Modelo del vehículo (opcional)
 * @param anio Año del vehículo (opcional)
 * @returns Lista de productos
 */
export async function buscarProductosPorRefaccion(
  refaccion: string,
  marca?: string,
  modelo?: string,
  anio?: number
): Promise<Producto[]> {
  try {
    if (!refaccion || refaccion.trim() === '') {
      console.warn('Se intentó buscar sin especificar refacción');
      return [];
    }

    const response = await apiRequest('POST', '/api/shopify/refaccion', {
      refaccion,
      marca,
      modelo,
      anio
    });
    
    const data = await response.json();
    
    if (data.success && data.productos) {
      return data.productos;
    }
    
    console.error('Error al buscar refacciones:', data.error || 'Respuesta inesperada');
    return [];
  } catch (error) {
    console.error('Error al buscar refacciones:', error);
    return [];
  }
}

/**
 * Busca múltiples refacciones en paralelo
 * @param refacciones Lista de refacciones a buscar
 * @param marca Marca del vehículo (opcional)
 * @param modelo Modelo del vehículo (opcional)
 * @param anio Año del vehículo (opcional)
 * @param limiteProductosPorRefaccion Número máximo de productos a devolver por refacción
 * @returns Objeto con refacciones como claves y listas de productos como valores
 */
export async function buscarMultiplesRefacciones(
  refacciones: string[],
  marca?: string,
  modelo?: string,
  anio?: number,
  limiteProductosPorRefaccion: number = 3
): Promise<{[key: string]: Producto[]}> {
  try {
    if (!refacciones || refacciones.length === 0) {
      return {};
    }

    // Filtrar refacciones vacías
    const refaccionesFiltradas = refacciones.filter(r => r && r.trim() !== '');
    
    if (refaccionesFiltradas.length === 0) {
      return {};
    }
    
    console.log(`Buscando ${refaccionesFiltradas.length} refacciones en paralelo`);
    
    // Crear un array de promesas para las búsquedas
    const promesasBusquedas = refaccionesFiltradas.map(refaccion => 
      buscarProductosPorRefaccion(refaccion, marca, modelo, anio)
    );
    
    // Esperar a que todas las búsquedas se completen
    const resultados = await Promise.all(promesasBusquedas);
    
    // Construir un objeto con los resultados
    const resultadosPorRefaccion: {[key: string]: Producto[]} = {};
    
    refaccionesFiltradas.forEach((refaccion, index) => {
      // Limitar el número de productos por refacción
      resultadosPorRefaccion[refaccion] = resultados[index].slice(0, limiteProductosPorRefaccion);
    });
    
    return resultadosPorRefaccion;
  } catch (error) {
    console.error('Error al buscar múltiples refacciones:', error);
    return {};
  }
}

/**
 * Formato HTML para mostrar productos en mensajes
 * @param producto Producto a formatear
 * @returns Texto HTML formateado
 */
export function formatoProductoHTML(producto: Producto): string {
  const precio = parseInt(producto.price) > 0 
    ? `$${parseFloat(producto.price).toFixed(2)} MXN` 
    : 'Precio a consultar';
  
  // Eliminar etiquetas HTML de la descripción
  let descripcion = '';
  if (producto.description) {
    descripcion = producto.description.replace(/<[^>]*>?/gm, '');
    if (descripcion.length > 80) {
      descripcion = descripcion.substring(0, 80) + '...';
    }
  }
  
  // Extraer variante para el checkout directo
  const variantId = producto.variantId.split('/').pop() || producto.variantId;
  
  // Generar una ID única para este botón
  const buttonId = `buy-now-${variantId}`;
  
  return `
    <div class="bg-zinc-900 p-3 rounded-md border border-zinc-800 mb-2">
      <div class="font-medium text-sm text-white mb-2">${producto.title}</div>
      ${producto.image ? `<img src="${producto.image}" alt="${producto.imageAlt || producto.title}" class="w-full h-auto max-h-40 object-contain mb-2 rounded">` : ''}
      ${descripcion ? `<div class="text-xs text-zinc-400 mb-2">${descripcion}</div>` : ''}
      <div class="text-amber-500 font-bold mb-2">${precio}</div>
      <div class="grid grid-cols-2 gap-2">
        <a href="https://autologic.mx/products/${producto.handle}" target="_blank" class="block bg-blue-600 text-white text-center py-1.5 px-2 rounded text-xs font-bold">Ver detalle</a>
        <a 
          id="${buttonId}" 
          href="https://autologic.mx/cart/${variantId}:1" 
          target="_blank" 
          class="block bg-amber-500 text-black text-center py-1.5 px-2 rounded text-xs font-bold"
          onclick="
            // URL de respaldo es enlace directo al carrito
            const fallbackUrl = 'https://autologic.mx/cart/${variantId}:1';
            
            // Intenta obtener ruta de checkout directo
            fetch('/api/shopify/checkout-directo', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                variantId: '${producto.variantId}', 
                quantity: 1 
              })
            })
            .then(res => res.json())
            .then(data => {
              if (data.success && data.url) {
                window.open(data.url, '_blank');
              } else {
                window.open(fallbackUrl, '_blank');
              }
            })
            .catch(err => {
              console.error('Error al obtener URL de checkout:', err);
              window.open(fallbackUrl, '_blank');
            });
            
            return false;
          "
        >Comprar ahora</a>
      </div>
    </div>
  `;
}

/**
 * Genera enlace para carrito de Shopify con productos seleccionados
 * @param productos Lista de productos a agregar al carrito
 * @returns URL del carrito con productos
 */
export function generarEnlaceCarrito(productos: Producto[]): string {
  if (!productos || productos.length === 0) {
    return 'https://autologic.mx/cart';
  }

  const items = productos
    .map(p => {
      // Extraer solo el número de ID de variante del formato "gid://shopify/ProductVariant/12345678"
      const variantId = p.variantId.split('/').pop() || '';
      return `${variantId}:1`;
    })
    .join(',');

  return `https://autologic.mx/cart/${items}`;
}

/**
 * Genera una URL de checkout directo para un producto mediante la API
 * @param variantId ID de la variante del producto
 * @param quantity Cantidad a comprar (por defecto 1)
 * @returns Promesa con la URL de checkout
 */
export async function obtenerUrlCheckoutDirecto(variantId: string, quantity: number = 1): Promise<string> {
  try {
    const response = await apiRequest('POST', '/api/shopify/checkout-directo', { 
      variantId, 
      quantity 
    });
    
    const data = await response.json();
    
    if (data.success && data.url) {
      return data.url;
    }
    
    console.error('Error al obtener URL de checkout:', data.error || 'Respuesta inesperada');
    // En caso de error, devolver URL al carrito general
    return 'https://autologic.mx/cart';
  } catch (error) {
    console.error('Error al obtener URL de checkout:', error);
    // En caso de error, devolver URL al carrito general
    return 'https://autologic.mx/cart';
  }
}

/**
 * Genera una URL de checkout para múltiples productos mediante la API
 * @param productos Lista de productos a comprar
 * @param quantities Objeto con cantidades por variantId (opcional)
 * @returns Promesa con la URL de checkout
 */
export async function obtenerUrlCheckoutMultiple(
  productos: Producto[], 
  quantities: {[key: string]: number} = {}
): Promise<string> {
  try {
    if (!productos || productos.length === 0) {
      return 'https://autologic.mx/cart';
    }
    
    // Convertir la lista de productos al formato esperado por la API
    const items = productos.map(producto => {
      return {
        variantId: producto.variantId,
        quantity: quantities[producto.variantId] || 1
      };
    });
    
    const response = await apiRequest('POST', '/api/shopify/checkout-multiple', { items });
    
    const data = await response.json();
    
    if (data.success && data.url) {
      return data.url;
    }
    
    console.error('Error al obtener URL de checkout múltiple:', data.error || 'Respuesta inesperada');
    // En caso de error, devolver URL al carrito general
    return 'https://autologic.mx/cart';
  } catch (error) {
    console.error('Error al obtener URL de checkout múltiple:', error);
    // En caso de error, devolver URL al carrito general
    return 'https://autologic.mx/cart';
  }
}

/**
 * Genera mensaje HTML con productos para el chat
 * @param productos Lista de productos
 * @returns HTML formateado
 */
export function generarMensajeProductos(productos: Producto[]): string {
  if (productos.length === 0) {
    return `
      <div class="mb-3">
        <div class="mb-3 text-sm">No encontré productos específicos para tu consulta.</div>
        <div class="p-4 border border-yellow-200 bg-yellow-50 dark:bg-zinc-800 dark:border-zinc-700 rounded-lg text-sm">
          <p class="font-medium text-yellow-800 dark:text-yellow-400 mb-2">Sugerencias:</p>
          <ul class="list-disc pl-5 text-yellow-700 dark:text-yellow-300 space-y-1">
            <li>Intenta con términos más generales</li>
            <li>Prueba con otra marca o modelo</li>
            <li>Revisa nuestra tienda completa para ver todas las opciones</li>
          </ul>
          <div class="mt-3">
            <a 
              href="https://autologic.mx/products" 
              target="_blank" 
              class="inline-block bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-1.5 px-3 rounded text-xs"
            >
              Ver todos los productos
            </a>
          </div>
        </div>
      </div>
    `;
  }
  
  let mensaje = '<div class="mb-3 text-sm">Encontré las siguientes refacciones en la tienda:</div>';
  
  // Limitar a 3 productos para no saturar la interfaz
  const productosLimitados = productos.slice(0, 3);
  
  mensaje += '<div class="productos-grid">';
  productosLimitados.forEach(producto => {
    mensaje += formatoProductoHTML(producto);
  });
  mensaje += '</div>';
  
  if (productos.length > 3) {
    mensaje += `<div class="text-xs text-zinc-400 mt-2">Y ${productos.length - 3} productos más disponibles en la tienda.</div>`;
  }
  
  // Generar enlace para agregar todos los productos al carrito
  if (productos.length > 0) {
    const linkCarrito = generarEnlaceCarrito(productos);
    mensaje += `
      <div class="mt-4">
        <a 
          id="checkout-multiple-link"
          href="${linkCarrito}" 
          target="_blank" 
          class="inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          onclick="
            fetch('/api/shopify/checkout-multiple', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                items: ${JSON.stringify(productos.map(p => ({ variantId: p.variantId, quantity: 1 })))} 
              })
            })
            .then(res => res.json())
            .then(data => {
              if (data.success && data.url) {
                window.open(data.url, '_blank');
              } else {
                window.open('${linkCarrito}', '_blank');
              }
            })
            .catch(err => {
              console.error('Error al obtener URL de checkout:', err);
              window.open('${linkCarrito}', '_blank');
            });
            return false;
          "
        >
          <span class="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Comprar ahora
          </span>
        </a>
      </div>
    `;
  }
  
  return mensaje;
}

/**
 * Genera mensaje HTML con productos agrupados por refacción
 * @param productosPorRefaccion Objeto con refacciones como claves y listas de productos como valores
 * @param titulo Título opcional para el mensaje
 * @returns HTML formateado
 */
export function generarMensajeMultiplesRefacciones(
  productosPorRefaccion: {[key: string]: Producto[]}, 
  titulo?: string
): string {
  // Verificar si hay productos
  const refacciones = Object.keys(productosPorRefaccion);
  const hayProductos = refacciones.some(refaccion => productosPorRefaccion[refaccion].length > 0);
  
  if (refacciones.length === 0 || !hayProductos) {
    return `
      <div class="mb-3">
        <div class="mb-3 text-sm">No encontré productos específicos para las refacciones solicitadas.</div>
        <div class="p-4 border border-yellow-200 bg-yellow-50 dark:bg-zinc-800 dark:border-zinc-700 rounded-lg text-sm">
          <p class="font-medium text-yellow-800 dark:text-yellow-400 mb-2">Sugerencias:</p>
          <ul class="list-disc pl-5 text-yellow-700 dark:text-yellow-300 space-y-1">
            <li>Intenta con términos más generales</li>
            <li>Prueba con otra marca o modelo de vehículo</li>
            <li>Revisa nuestra tienda completa para ver todas las opciones</li>
          </ul>
          <div class="mt-3">
            <a 
              href="https://autologic.mx/products" 
              target="_blank" 
              class="inline-block bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-1.5 px-3 rounded text-xs"
            >
              Ver todos los productos
            </a>
          </div>
        </div>
      </div>
    `;
  }
  
  // Título del mensaje
  const mensajeTitulo = titulo || 'Aquí tienes las refacciones recomendadas para tu vehículo:';
  let mensaje = `<div class="mb-4 text-sm">${mensajeTitulo}</div>`;
  
  // Crear una lista de todos los productos para el carrito
  const todosLosProductos: Producto[] = [];
  
  // Generar secciones para cada refacción
  refacciones.forEach(refaccion => {
    const productos = productosPorRefaccion[refaccion];
    
    if (productos.length === 0) {
      return; // Saltar refacciones sin productos
    }
    
    // Agregar productos al total para el carrito
    todosLosProductos.push(...productos);
    
    mensaje += `
      <div class="mb-6">
        <div class="bg-zinc-800 text-white px-3 py-2 rounded-t-md font-medium text-sm border-b border-amber-500">
          ${refaccion}
        </div>
        <div class="productos-grid p-2 bg-zinc-900 rounded-b-md">
    `;
    
    // Mostrar hasta 2 productos por refacción
    const productosLimitados = productos.slice(0, 2);
    productosLimitados.forEach(producto => {
      mensaje += formatoProductoHTML(producto);
    });
    
    mensaje += '</div>';
    
    // Mensaje si hay más productos
    if (productos.length > 2) {
      mensaje += `<div class="text-xs text-zinc-400 mt-1 text-right">Y ${productos.length - 2} productos más disponibles.</div>`;
    }
    
    mensaje += '</div>';
  });
  
  // Generar enlace para agregar todos los productos al carrito
  if (todosLosProductos.length > 0) {
    const linkCarrito = generarEnlaceCarrito(todosLosProductos);
    mensaje += `
      <div class="mt-6 mb-2 pt-4 border-t border-zinc-700">
        <div class="bg-zinc-800 p-3 rounded-md">
          <div class="text-sm text-white mb-3">¿Quieres comprar todas las refacciones recomendadas?</div>
          <a 
            id="checkout-multiple-refacciones"
            href="${linkCarrito}" 
            target="_blank" 
            class="block bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded text-center"
            onclick="
              fetch('/api/shopify/checkout-multiple', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                  items: ${JSON.stringify(todosLosProductos.map(p => ({ variantId: p.variantId, quantity: 1 })))} 
                })
              })
              .then(res => res.json())
              .then(data => {
                if (data.success && data.url) {
                  window.open(data.url, '_blank');
                } else {
                  window.open('${linkCarrito}', '_blank');
                }
              })
              .catch(err => {
                console.error('Error al obtener URL de checkout:', err);
                window.open('${linkCarrito}', '_blank');
              });
              return false;
            "
          >
            <span class="flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Comprar todo ahora (${todosLosProductos.length} productos)
            </span>
          </a>
        </div>
        <div class="text-xs text-zinc-500 mt-2 text-center">
          Se procesará tu compra directo en la pasarela de pago de Shopify.
        </div>
      </div>
    `;
  }
  
  return mensaje;
}