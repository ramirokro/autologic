
/**
 * Genera mensaje optimizado para productos de Shopify con imágenes y links directos
 * @param productosPorRefaccion Objeto con refacciones como claves y listas de productos como valores
 * @param vehiculo Información del vehículo
 * @param titulo Título opcional para el mensaje
 * @returns HTML formateado
 */
export function generarMensajeRefaccionesShopify(
  productosPorRefaccion: {[key: string]: Producto[]},
  vehiculo: { make: string; model: string; year: number; engine?: string },
  titulo?: string
): string {
  // Verificar si hay productos
  const refacciones = Object.keys(productosPorRefaccion);
  const hayProductos = refacciones.some(refaccion => productosPorRefaccion[refaccion].length > 0);
  
  if (refacciones.length === 0 || !hayProductos) {
    return `
      <div class="mb-3">
        <div class="mb-3 text-sm">No encontré productos específicos para tu ${vehiculo.make} ${vehiculo.model} ${vehiculo.year}.</div>
        <div class="p-4 border border-yellow-200 bg-yellow-50 dark:bg-zinc-800 dark:border-zinc-700 rounded-lg text-sm">
          <p class="font-medium text-yellow-800 dark:text-yellow-400 mb-2">Para conseguir las refacciones que necesitas:</p>
          <div class="mt-3 space-y-2">
            <a 
              href="https://autologic.mx" 
              target="_blank" 
              class="block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-center"
            >
              Visitar nuestra tienda
            </a>
            <a
              href="https://wa.me/5215512345678?text=Hola,%20necesito%20refacciones%20para%20mi%20${vehiculo.make}%20${vehiculo.model}%20${vehiculo.year}"
              target="_blank"
              class="block bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded text-center"
            >
              Contactar por WhatsApp
            </a>
          </div>
        </div>
      </div>
    `;
  }
  
  // Título del mensaje
  const mensajeTitulo = titulo || `Refacciones disponibles para tu ${vehiculo.make} ${vehiculo.model} ${vehiculo.year}:`;
  let mensaje = `<div class="mb-4 text-sm font-medium">${mensajeTitulo}</div>`;
  
  // Crear una lista de todos los productos para el carrito
  const todosLosProductos: Producto[] = [];
  
  // Generar secciones para cada refacción con diseño mejorado
  refacciones.forEach(refaccion => {
    const productos = productosPorRefaccion[refaccion];
    
    if (productos.length === 0) {
      return; // Saltar refacciones sin productos
    }
    
    // Agregar productos al total para el carrito
    todosLosProductos.push(...productos);
    
    mensaje += `
      <div class="mb-6">
        <div class="bg-blue-800 text-white px-3 py-2 rounded-t-md font-medium text-sm">
          ${refaccion} para ${vehiculo.make} ${vehiculo.model}
        </div>
        <div class="p-3 border border-blue-200 dark:border-blue-900 rounded-b-md bg-white dark:bg-zinc-900">
    `;
    
    // Mostrar hasta 2 productos por refacción
    const productosLimitados = productos.slice(0, 2);
    productosLimitados.forEach(producto => {
      const imagenUrl = producto.image || '';
      const precio = formatPrice(producto.price);
      const link = `https://autologic.mx/products/${producto.handle}`;
      
      mensaje += `
        <div class="mb-3 p-3 border border-gray-200 dark:border-zinc-700 rounded-md flex flex-col sm:flex-row gap-3">
          ${imagenUrl ? `
            <div class="flex-shrink-0">
              <img src="${imagenUrl}" class="w-20 h-20 object-contain" />
            </div>` : ''}
          <div class="flex-grow">
            <div class="font-medium mb-1">${producto.title}</div>
            <div class="text-green-600 dark:text-green-400 font-bold mb-2">$${precio} MXN</div>
            <a 
              href="${link}" 
              target="_blank" 
              class="inline-block bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-1 px-3 rounded"
            >
              Ver detalles
            </a>
          </div>
        </div>
      `;
    });
    
    mensaje += '</div>';
    
    // Enlace para ver más productos de esta categoría
    if (productos.length > 2) {
      const searchUrl = `https://autologic.mx/search?q=${encodeURIComponent(`${refaccion} ${vehiculo.make} ${vehiculo.model}`)}`;
      mensaje += `
        <div class="mt-1 text-right">
          <a 
            href="${searchUrl}" 
            target="_blank" 
            class="text-xs text-blue-600 dark:text-blue-400 hover:underline"
          >
            Ver ${productos.length - 2} productos más...
          </a>
        </div>
      `;
    }
    
    mensaje += '</div>';
  });
  
  // Generar enlace para agregar todos los productos al carrito con diseño más destacado
  if (todosLosProductos.length > 0) {
    const linkCarrito = generarEnlaceCarrito(todosLosProductos);
    mensaje += `
      <div class="mt-6 mb-2 pt-4 border-t border-zinc-700">
        <div class="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
          <div class="text-sm font-medium mb-3">¿Necesitas todas estas refacciones para tu ${vehiculo.make} ${vehiculo.model}?</div>
          <a 
            href="${linkCarrito}" 
            target="_blank" 
            class="block bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded text-center"
          >
            <span class="flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Agregar todas las refacciones al carrito
            </span>
          </a>
        </div>
      </div>
    `;
  }
  
  return mensaje;
}

// Exportamos todas las funciones
export {
  buscarProductos,
  buscarProductosPorRefaccion,
  buscarMultiplesRefacciones,
  formatoProductoHTML,
  formatPrice,
  generarMensajeProductos,
  generarMensajeMultiplesRefacciones,
  generarMensajeRefaccionesShopify,
  generarEnlaceCarrito
};
