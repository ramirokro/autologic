import dotenv from 'dotenv';
dotenv.config();

// Verifica si existe la variable de entorno con el token de Shopify
if (!process.env.SHOPIFY_API_TOKEN) {
  console.warn('SHOPIFY_API_TOKEN no está definido. La integración con Shopify no funcionará correctamente.');
}

// Usar el dominio principal de autologic.mx si está accesible
// o caer al dominio myshopify.com si es necesario
export const SHOPIFY_DOMAIN = 'autologic.mx'; // Dominio principal
const SHOPIFY_MYSHOPIFY_DOMAIN = 'autologicshop.myshopify.com'; // Dominio alternativo
const SHOPIFY_API_VERSION = '2023-10'; // Versión a intentar
const SHOPIFY_API_VERSION_FALLBACK = '2023-07'; // Versión de respaldo
const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_API_TOKEN || '';

// URLs para checkout directo
export const CHECKOUT_URL = `https://${SHOPIFY_DOMAIN}/cart`;
export const CHECKOUT_URL_ALTERNATIVE = `https://${SHOPIFY_MYSHOPIFY_DOMAIN}/cart`;

// URLs para las APIs
// GraphQL
const SHOP_GRAPHQL_URL = `https://${SHOPIFY_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;
const SHOP_GRAPHQL_URL_ALTERNATIVE = `https://${SHOPIFY_MYSHOPIFY_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;

// REST
const SHOP_REST_URL = `https://${SHOPIFY_DOMAIN}/api/${SHOPIFY_API_VERSION}/products.json`;
const SHOP_REST_URL_ALTERNATIVE = `https://${SHOPIFY_MYSHOPIFY_DOMAIN}/api/${SHOPIFY_API_VERSION}/products.json`;
const SHOP_REST_URL_FALLBACK = `https://${SHOPIFY_MYSHOPIFY_DOMAIN}/api/${SHOPIFY_API_VERSION_FALLBACK}/products.json`;

// Depuración - para verificar que el token está siendo cargado correctamente
console.log('Shopify Token Disponible:', !!SHOPIFY_ACCESS_TOKEN);
console.log('Usando dominio principal de tienda:', SHOPIFY_DOMAIN);
console.log('Dominio alternativo disponible:', SHOPIFY_MYSHOPIFY_DOMAIN);
console.log('Token (primeros 10 caracteres):', SHOPIFY_ACCESS_TOKEN.substring(0, 10) + '...');
console.log('Token (últimos 5 caracteres):', '...' + SHOPIFY_ACCESS_TOKEN.substring(SHOPIFY_ACCESS_TOKEN.length - 5));

/**
 * Interfaz para la estructura de productos en la respuesta GraphQL
 */
interface ShopifyGraphQLProductoNode {
  id: string;
  title: string;
  handle: string;
  description: string;
  images: {
    edges: Array<{
      node: {
        originalSrc: string;
        altText: string | null;
      }
    }>
  };
  variants: {
    edges: Array<{
      node: {
        id: string;
        price: {
          amount: string;
        };
      }
    }>
  };
}

/**
 * Tipo simplificado para la respuesta
 */
interface Producto {
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
 * Busca productos en Shopify basados en un texto de consulta usando GraphQL
 * @param queryTexto Texto para buscar productos (ej: "Sensor MAF Nissan Altima 2010")
 * @returns Lista de productos encontrados
 */
export async function buscarProductos(queryTexto: string) {
  try {
    console.log(`Buscando productos con el término: "${queryTexto}"`);
    
    // ======== PRIMERO INTENTAMOS CON LA API REST ========
    // Esta funciona bien con el token actual, así que primero probamos esta
    try {
      console.log('Intentando con la API REST en el dominio principal...');
      // Intentar obtener todos los productos si no hay término específico
      const restUrl = queryTexto.trim() === '' 
        ? `${SHOP_REST_URL}?limit=10` 
        : `${SHOP_REST_URL}?title=${encodeURIComponent(queryTexto)}&limit=10`;
      console.log('URL REST:', restUrl);
      
      const restResponse = await fetch(restUrl, {
        method: 'GET',
        headers: {
          'X-Shopify-Storefront-Access-Token': SHOPIFY_ACCESS_TOKEN,
          'Content-Type': 'application/json'
        }
      });
      
      // Si el dominio principal falla, intentar con el dominio alternativo
      if (!restResponse.ok) {
        console.log('API REST en dominio principal falló, intentando con dominio alternativo...');
        const restUrlAlt = queryTexto.trim() === '' 
          ? `${SHOP_REST_URL_ALTERNATIVE}?limit=10` 
          : `${SHOP_REST_URL_ALTERNATIVE}?title=${encodeURIComponent(queryTexto)}&limit=10`;
        console.log('URL REST alternativa:', restUrlAlt);
        
        const restResponseAlt = await fetch(restUrlAlt, {
          method: 'GET',
          headers: {
            'X-Shopify-Storefront-Access-Token': SHOPIFY_ACCESS_TOKEN,
            'Content-Type': 'application/json'
          }
        });
        
        // Si también falla, probar con Admin API como último recurso
        if (!restResponseAlt.ok) {
          console.log('API REST en dominio alternativo falló, intentando con Admin API...');
          const adminUrl = queryTexto.trim() === '' 
            ? `https://${SHOPIFY_MYSHOPIFY_DOMAIN}/admin/api/${SHOPIFY_API_VERSION_FALLBACK}/products.json?limit=10`
            : `https://${SHOPIFY_MYSHOPIFY_DOMAIN}/admin/api/${SHOPIFY_API_VERSION_FALLBACK}/products.json?limit=10&title=${encodeURIComponent(queryTexto)}`;
          console.log('URL Admin API:', adminUrl);
          
          const adminResponse = await fetch(adminUrl, {
            method: 'GET',
            headers: {
              'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
              'Content-Type': 'application/json'
            }
          });
          
          if (!adminResponse.ok) {
            console.error('Todas las APIs REST fallaron, último intento con GraphQL...');
            throw new Error('APIs REST no disponibles');
          }
          
          // Procesar respuesta Admin API
          const adminData = await adminResponse.json();
          console.log('Respuesta Admin API recibida:', JSON.stringify(adminData).substring(0, 100) + '...');
          
          // Mapear productos desde la respuesta Admin API
          if (adminData.products && Array.isArray(adminData.products)) {
            return adminData.products.map((product: any) => {
              const imagen = product.image ? product.image.src : '';
              const imagenAlt = product.image && product.image.alt ? product.image.alt : product.title;
              const precio = product.variants && product.variants.length > 0 ? product.variants[0].price : '0';
              const variantId = product.variants && product.variants.length > 0 ? product.variants[0].id : '';
              
              return {
                id: product.id,
                title: product.title,
                handle: product.handle,
                description: product.body_html || '',
                image: imagen,
                imageAlt: imagenAlt,
                price: precio,
                variantId: variantId
              };
            });
          }
          
          return [];
        }
        
        // Procesar respuesta REST alternativa
        const restAltData = await restResponseAlt.json();
        console.log('Respuesta REST alternativa recibida:', JSON.stringify(restAltData).substring(0, 100) + '...');
        
        // Mapear productos desde la respuesta REST alternativa
        if (restAltData.products && Array.isArray(restAltData.products)) {
          return restAltData.products.map((product: any) => {
            const imagen = product.image ? product.image.src : '';
            const imagenAlt = product.image && product.image.alt ? product.image.alt : product.title;
            const precio = product.variants && product.variants.length > 0 ? product.variants[0].price : '0';
            const variantId = product.variants && product.variants.length > 0 ? product.variants[0].id : '';
            
            return {
              id: product.id,
              title: product.title,
              handle: product.handle,
              description: product.body_html || '',
              image: imagen,
              imageAlt: imagenAlt,
              price: precio,
              variantId: variantId
            };
          });
        }
        
        return [];
      }
      
      // Procesar respuesta REST del dominio principal
      const restData = await restResponse.json();
      console.log('Respuesta REST principal recibida:', JSON.stringify(restData).substring(0, 100) + '...');
      
      // Mapear productos desde la respuesta REST principal
      if (restData.products && Array.isArray(restData.products)) {
        return restData.products.map((product: any) => {
          const imagen = product.image ? product.image.src : '';
          const imagenAlt = product.image && product.image.alt ? product.image.alt : product.title;
          const precio = product.variants && product.variants.length > 0 ? product.variants[0].price : '0';
          const variantId = product.variants && product.variants.length > 0 ? product.variants[0].id : '';
          
          return {
            id: product.id,
            title: product.title,
            handle: product.handle,
            description: product.body_html || '',
            image: imagen,
            imageAlt: imagenAlt,
            price: precio,
            variantId: variantId
          };
        });
      }
      
      return [];
      
    } catch (restError) {
      console.error('Error en las APIs REST, intentando con GraphQL:', restError);
      
      // ======== SOLO SI LAS APIS REST FALLAN, INTENTAMOS CON GRAPHQL ========
      // Construir la consulta GraphQL según lo recomendado en la guía
      // Escapar comillas en la consulta para evitar problemas con GraphQL
      const searchQuery = queryTexto.replace(/"/g, '\\"');
      
      const query = {
        query: `
          query {
            products(first: 10, query: "${searchQuery}") {
              edges {
                node {
                  id
                  title
                  handle
                  description
                  images(first: 1) {
                    edges {
                      node {
                        originalSrc
                        altText
                      }
                    }
                  }
                  variants(first: 1) {
                    edges {
                      node {
                        id
                        price {
                          amount
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        `
      };
      
      // Intentar primero con el dominio principal
      let graphqlUrl = SHOP_GRAPHQL_URL;
      console.log('Enviando consulta GraphQL a:', graphqlUrl);
      
      let response = await fetch(graphqlUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': SHOPIFY_ACCESS_TOKEN
        },
        body: JSON.stringify(query)
      });
      
      // Si falla, intentar con el dominio alternativo
      if (!response.ok) {
        console.log('GraphQL en dominio principal falló, intentando con dominio alternativo');
        graphqlUrl = SHOP_GRAPHQL_URL_ALTERNATIVE;
        console.log('URL GraphQL alternativa:', graphqlUrl);
        
        response = await fetch(graphqlUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Storefront-Access-Token': SHOPIFY_ACCESS_TOKEN
          },
          body: JSON.stringify(query)
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error en la solicitud a Shopify GraphQL (dominio alternativo):', errorText);
          return [];
        }
      }
      
      // Procesar la respuesta GraphQL
      const data = await response.json();
      console.log('Respuesta GraphQL recibida:', JSON.stringify(data).substring(0, 150) + '...');
      
      // Verificar si hay errores en la respuesta GraphQL
      if (data.errors) {
        console.error('Errores en la respuesta GraphQL:', data.errors);
        return [];
      }
      
      // Extraer productos de la respuesta GraphQL
      if (data.data && data.data.products && data.data.products.edges) {
        return data.data.products.edges.map(({ node }: { node: ShopifyGraphQLProductoNode }) => {
          // Extraer imagen si hay disponible
          const image = node.images.edges.length > 0 
            ? node.images.edges[0].node.originalSrc 
            : '';
          
          // Extraer texto alternativo de la imagen
          const imageAlt = node.images.edges.length > 0 && node.images.edges[0].node.altText
            ? node.images.edges[0].node.altText
            : node.title;
          
          // Extraer precio y ID de variante (si están disponibles)
          const price = node.variants.edges.length > 0
            ? node.variants.edges[0].node.price.amount
            : '0';
            
          const variantId = node.variants.edges.length > 0
            ? node.variants.edges[0].node.id
            : '';
          
          // Retornar objeto con formato simplificado
          return {
            id: node.id,
            title: node.title,
            handle: node.handle,
            description: node.description || '',
            image: image,
            imageAlt: imageAlt,
            price: price,
            variantId: variantId
          };
        });
      }
      
      return [];
    }
  } catch (error) {
    console.error('Error al buscar productos en Shopify:', error);
    return [];
  }
}

/**
 * Busca productos en Shopify basados en una refacción y datos del vehículo
 * @param refaccion Nombre de la refacción (ej: "Sensor MAF")
 * @param marca Marca del vehículo
 * @param modelo Modelo del vehículo
 * @param anio Año del vehículo
 * @returns Lista de productos encontrados
 */
export async function buscarProductosPorRefaccion(
  refaccion: string,
  marca?: string,
  modelo?: string,
  anio?: number
) {
  try {
    if (!refaccion || refaccion.trim() === '') {
      console.warn('Se intentó buscar sin especificar refacción');
      return [];
    }
    
    // Normalizar textos para búsqueda
    const refaccionNormalizada = normalizarTexto(refaccion);
    const marcaNormalizada = marca ? normalizarTexto(marca) : '';
    const modeloNormalizado = modelo ? normalizarTexto(modelo) : '';
    
    // Estrategia 1: búsqueda precisa con todos los parámetros
    let queryTexto = refaccionNormalizada;
    
    if (marcaNormalizada) {
      queryTexto += ` ${marcaNormalizada}`;
    }
    
    if (modeloNormalizado) {
      queryTexto += ` ${modeloNormalizado}`;
    }
    
    if (anio) {
      queryTexto += ` ${anio}`;
    }
    
    console.log(`Estrategia 1: Búsqueda combinada con texto "${queryTexto}"`);
    
    // Utilizar la función de búsqueda general
    let resultados = await buscarProductos(queryTexto);
    
    // Estrategia 2: si no hay resultados o son pocos, buscar con sinónimos comunes
    if (resultados.length < 2) {
      const sinonimos = obtenerSinonimosRefaccion(refaccionNormalizada);
      if (sinonimos.length > 0) {
        const promesasBusquedas = sinonimos.map(async (sinonimo) => {
          let querySinonimo = sinonimo;
          if (marcaNormalizada) querySinonimo += ` ${marcaNormalizada}`;
          if (modeloNormalizado) querySinonimo += ` ${modeloNormalizado}`;
          if (anio) querySinonimo += ` ${anio}`;
          
          console.log(`Estrategia 2: Búsqueda con sinónimo "${querySinonimo}"`);
          return await buscarProductos(querySinonimo);
        });
        
        const resultadosSinonimos = await Promise.all(promesasBusquedas);
        // Aplanar el array de resultados y eliminar duplicados por ID
        const productosUnicos = new Map();
        [...resultados, ...resultadosSinonimos.flat()].forEach(producto => {
          productosUnicos.set(producto.id, producto);
        });
        
        resultados = Array.from(productosUnicos.values());
      }
    }
    
    // Estrategia 3: si no hay resultados, probar combinaciones parciales
    if (resultados.length === 0) {
      const combinaciones = [];
      
      // Refacción + marca
      if (marcaNormalizada) {
        combinaciones.push(`${refaccionNormalizada} ${marcaNormalizada}`);
      }
      
      // Refacción + modelo
      if (modeloNormalizado) {
        combinaciones.push(`${refaccionNormalizada} ${modeloNormalizado}`);
      }
      
      // Solamente refacción
      combinaciones.push(refaccionNormalizada);
      
      // Buscar en paralelo con todas las combinaciones
      const promesasCombinaciones = combinaciones.map(query => {
        console.log(`Estrategia 3: Búsqueda con combinación "${query}"`);
        return buscarProductos(query);
      });
      
      const resultadosCombinaciones = await Promise.all(promesasCombinaciones);
      
      // Combinar resultados eliminando duplicados
      const productosUnicos = new Map();
      resultadosCombinaciones.flat().forEach(producto => {
        productosUnicos.set(producto.id, producto);
      });
      
      resultados = Array.from(productosUnicos.values());
    }
    
    // Filtrar productos irrelevantes si tenemos datos de vehículo
    if (marca && modelo) {
      resultados = filtrarProductosRelevantes(resultados, marcaNormalizada, modeloNormalizado);
    }
    
    // Ordenar resultados por relevancia
    resultados = ordenarPorRelevancia(resultados, refaccionNormalizada, marcaNormalizada, modeloNormalizado, anio);
    
    console.log(`Resultados encontrados: ${resultados.length} productos`);
    
    return resultados;
  } catch (error) {
    console.error('Error al buscar productos por refacción:', error);
    return [];
  }
}

/**
 * Normaliza texto para búsqueda (minúsculas, sin acentos, etc.)
 */
function normalizarTexto(texto: string): string {
  if (!texto) return '';
  
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
    .replace(/[^\w\s]/g, ' ')        // Reemplazar caracteres especiales por espacios
    .replace(/\s+/g, ' ')            // Eliminar espacios múltiples
    .trim();
}

/**
 * Obtiene sinónimos comunes para refacciones automotrices
 */
function obtenerSinonimosRefaccion(refaccion: string): string[] {
  const diccionarioSinonimos: {[key: string]: string[]} = {
    // Sensores
    'sensor maf': ['medidor flujo aire', 'sensor flujo masa aire', 'mass air flow', 'maf'],
    'sensor map': ['sensor presion multiple', 'manifold absolute pressure', 'map'],
    'sensor oxigeno': ['sonda lambda', 'o2 sensor', 'sensor lambda'],
    'sensor tps': ['sensor posicion acelerador', 'throttle position sensor'],
    'sensor ckp': ['sensor posicion ciguenal', 'crankshaft position sensor'],
    'sensor cmp': ['sensor posicion arbol levas', 'camshaft position sensor'],
    
    // Frenos
    'balatas': ['pastillas freno', 'brake pads'],
    'discos freno': ['rotores freno', 'brake discs', 'brake rotors'],
    'tambor freno': ['drum brake'],
    'caliper': ['mordaza freno', 'pinza freno'],
    
    // Suspensión
    'amortiguador': ['shock absorber', 'strut'],
    'resorte': ['spring', 'muelle'],
    'rotula': ['ball joint'],
    'buje': ['bushing', 'silent block'],
    'terminal direccion': ['tie rod end'],
    
    // Motor
    'bujia': ['spark plug'],
    'bomba agua': ['water pump'],
    'bomba aceite': ['oil pump'],
    'termostato': ['thermostat'],
    'radiador': ['radiator'],
    'alternador': ['alternator', 'generator'],
    'arrancador': ['marcha', 'starter', 'motor arranque'],
    'valvula egr': ['egr valve'],
    'correa distribucion': ['timing belt', 'banda tiempo'],
    'cadena distribucion': ['timing chain', 'cadena tiempo'],
    
    // Transmisión
    'embrague': ['clutch'],
    'volante motor': ['flywheel'],
    'caja cambios': ['transmission', 'transmision'],
    'diferencial': ['differential'],
    
    // Eléctricos
    'bateria': ['battery', 'acumulador'],
    'faro': ['headlight', 'headlamp'],
    'bombilla': ['bulb', 'foco'],
    
    // Filtros
    'filtro aceite': ['oil filter'],
    'filtro aire': ['air filter'],
    'filtro combustible': ['fuel filter', 'filtro gasolina'],
    'filtro habitaculo': ['cabin filter', 'filtro polen'],
  };
  
  // Buscar en el diccionario
  for (const [clave, sinonimos] of Object.entries(diccionarioSinonimos)) {
    if (refaccion.includes(clave) || sinonimos.some(s => refaccion.includes(s))) {
      // Devolver todos los sinónimos excepto el que ya usamos en la búsqueda original
      return [clave, ...sinonimos].filter(s => !refaccion.includes(s));
    }
  }
  
  return [];
}

/**
 * Filtra productos para asegurar que sean relevantes para el vehículo específico
 * @param productos Lista de productos a filtrar
 * @param marca Marca del vehículo
 * @param modelo Modelo del vehículo
 * @returns Lista filtrada de productos
 */
function filtrarProductosRelevantes(
  productos: Producto[],
  marca: string,
  modelo: string
): Producto[] {
  // Lista de marcas de automóviles para detectar incompatibilidades
  const marcasAutos = [
    'nissan', 'toyota', 'honda', 'ford', 'chevrolet', 'volkswagen', 'vw', 
    'mazda', 'kia', 'hyundai', 'bmw', 'mercedes', 'audi', 'seat', 'renault',
    'dodge', 'jeep', 'chrysler', 'fiat', 'mitsubishi', 'subaru', 'suzuki',
    'lexus', 'acura', 'infiniti'
  ];
  
  // Marcas genéricas de repuestos (no son marcas de vehículos)
  const marcasGenericas = [
    'bosch', 'denso', 'valeo', 'gates', 'ngk', 'febi', 'sachs', 'brembo', 
    'monroe', 'kyb', 'delphi', 'mahle', 'gabriel', 'moog', 'ac delco', 'acdelco'
  ];
  
  return productos.filter(producto => {
    const titulo = normalizarTexto(producto.title);
    const descripcion = normalizarTexto(producto.description);
    
    // Si el título o descripción menciona explícitamente nuestra marca o modelo, es relevante
    if (titulo.includes(marca) || titulo.includes(modelo) || 
        descripcion.includes(marca) || descripcion.includes(modelo)) {
      return true;
    }
    
    // Si el título menciona explícitamente otra marca de auto (excepto marcas genéricas)
    // y esa marca NO es la nuestra, entonces el producto probablemente no sea compatible
    for (const marcaAuto of marcasAutos) {
      // No verificar nuestra propia marca
      if (marcaAuto === marca) continue;
      
      // Si menciona otra marca de auto en el título, probablemente sea incompatible
      if (titulo.includes(marcaAuto)) {
        // Verificar si también es una marca genérica de repuestos (en cuyo caso podría ser compatible)
        if (!marcasGenericas.some(mg => titulo.includes(mg))) {
          // Prueba adicional: si menciona explícitamente "universal" o "múltiples marcas", podría ser compatible
          if (titulo.includes('universal') || 
              titulo.includes('multiple') || 
              titulo.includes('multiples marcas') ||
              titulo.includes('compatible con')) {
            return true;
          }
          return false; // No es compatible
        }
      }
    }
    
    // Por defecto, incluir el producto
    return true;
  });
}

/**
 * Ordena productos por relevancia según los términos de búsqueda
 */
function ordenarPorRelevancia(
  productos: Producto[], 
  refaccion: string, 
  marca?: string, 
  modelo?: string, 
  anio?: number
): Producto[] {
  return productos.sort((a, b) => {
    // Normalizar textos de productos
    const tituloA = normalizarTexto(a.title);
    const tituloB = normalizarTexto(b.title);
    const descripcionA = normalizarTexto(a.description);
    const descripcionB = normalizarTexto(b.description);
    
    // Calcular puntuaciones
    let puntajeA = 0;
    let puntajeB = 0;
    
    // PUNTUACIÓN EXACTA: Si un producto menciona explícitamente el vehículo completo
    // Esta es la coincidencia más importante y debe tener la mayor prioridad
    if (marca && modelo) {
      const vehiculoCompleto = `${marca} ${modelo}`;
      const vehiculoCompletoConAnio = anio ? `${marca} ${modelo} ${anio}` : vehiculoCompleto;
      
      // Coincidencia exacta del vehículo completo en título (máxima prioridad)
      if (tituloA.includes(vehiculoCompleto)) puntajeA += 50;
      if (tituloB.includes(vehiculoCompleto)) puntajeB += 50;
      
      // Coincidencia exacta del vehículo completo con año (aún mayor prioridad)
      if (anio && tituloA.includes(vehiculoCompletoConAnio)) puntajeA += 70;
      if (anio && tituloB.includes(vehiculoCompletoConAnio)) puntajeB += 70;
      
      // Coincidencia en descripción (menor prioridad pero sigue siendo importante)
      if (descripcionA.includes(vehiculoCompleto)) puntajeA += 25;
      if (descripcionB.includes(vehiculoCompleto)) puntajeB += 25;
    }
    
    // Puntos por refacción en título (importante)
    if (tituloA.includes(refaccion)) puntajeA += 20;
    if (tituloB.includes(refaccion)) puntajeB += 20;
    
    // Puntos por marca en título (muy importante)
    if (marca) {
      if (tituloA.includes(marca)) puntajeA += 15;
      if (tituloB.includes(marca)) puntajeB += 15;
    }
    
    // Puntos por modelo en título (muy importante)
    if (modelo) {
      if (tituloA.includes(modelo)) puntajeA += 15;
      if (tituloB.includes(modelo)) puntajeB += 15;
    }
    
    // Puntos por año en título (importante)
    if (anio) {
      if (tituloA.includes(anio.toString())) puntajeA += 10;
      if (tituloB.includes(anio.toString())) puntajeB += 10;
    }
    
    // Penalización: si menciona explícitamente otra marca o modelo diferente
    // (excepto marcas genéricas comunes que funcionan en múltiples vehículos)
    if (marca && modelo) {
      const marcasComunes = ['bosch', 'denso', 'valeo', 'gates', 'ngk', 'febi', 'sachs', 'brembo', 'monroe', 'kyb', 'delphi', 'mahle', 'gabriel', 'moog', 'ac delco', 'acdelco'];
      
      // Si no es una marca común de repuestos y el título menciona otra marca de auto
      if (!marcasComunes.some(m => marca.toLowerCase().includes(m))) {
        // Lista de marcas principales para detectar incompatibilidades
        const marcasAutos = ['nissan', 'toyota', 'honda', 'ford', 'chevrolet', 'volkswagen', 'vw', 'mazda', 'kia', 'hyundai', 'bmw', 'mercedes', 'audi', 'seat', 'renault', 'dodge', 'jeep', 'chrysler', 'fiat', 'mitsubishi', 'subaru', 'suzuki', 'lexus', 'acura', 'infiniti'];
        
        // Penalizar si menciona otra marca (que no sea la buscada)
        marcasAutos.forEach(marcaAuto => {
          if (marcaAuto !== marca.toLowerCase()) {
            if (tituloA.includes(marcaAuto)) puntajeA -= 40;  // Fuerte penalización
            if (tituloB.includes(marcaAuto)) puntajeB -= 40;
          }
        });
      }
    }
    
    // Puntos adicionales por coincidencias en descripción
    if (refaccion && descripcionA.includes(refaccion)) puntajeA += 5;
    if (refaccion && descripcionB.includes(refaccion)) puntajeB += 5;
    if (marca && descripcionA.includes(marca)) puntajeA += 3;
    if (marca && descripcionB.includes(marca)) puntajeB += 3;
    if (modelo && descripcionA.includes(modelo)) puntajeA += 3;
    if (modelo && descripcionB.includes(modelo)) puntajeB += 3;
    
    // Productos con imagen tienen prioridad
    if (a.image && !b.image) puntajeA += 3;
    if (!a.image && b.image) puntajeB += 3;
    
    // Productos con precio tienen prioridad
    if (parseFloat(a.price) > 0 && parseFloat(b.price) <= 0) puntajeA += 4;
    if (parseFloat(a.price) <= 0 && parseFloat(b.price) > 0) puntajeB += 4;
    
    // Imprimir puntajes para depuración (opcional)
    // console.log(`Producto A: ${a.title} - Puntaje: ${puntajeA}`);
    // console.log(`Producto B: ${b.title} - Puntaje: ${puntajeB}`);
    
    return puntajeB - puntajeA; // Orden descendente por puntaje
  });
}

/**
 * Genera una URL de checkout directo para un producto específico
 * @param variantId ID de la variante del producto a comprar
 * @param quantity Cantidad a comprar (por defecto 1)
 * @returns URL completa para checkout directo
 */
export function generarUrlCheckoutDirecto(variantId: string, quantity: number = 1): string {
  try {
    // Extraer solo el número del variantId si está en formato de GraphQL (gid://shopify/ProductVariant/1234567890)
    const variantIdLimpio = variantId.includes('/')
      ? variantId.split('/').pop() || variantId
      : variantId;
    
    // Formato: /cart/{variant_id}:{quantity}
    return `${CHECKOUT_URL}/${variantIdLimpio}:${quantity}`;
  } catch (error) {
    console.error('Error al generar URL de checkout directo:', error);
    return CHECKOUT_URL;
  }
}

/**
 * Genera una URL de checkout directo para múltiples productos
 * @param items Array de objetos con variantId y quantity
 * @returns URL completa para checkout directo con múltiples productos
 */
export function generarUrlCheckoutMultiple(items: {variantId: string, quantity: number}[]): string {
  if (!items || items.length === 0) {
    return CHECKOUT_URL;
  }
  
  try {
    // Formato: /cart/{variant_id1}:{quantity1},{variant_id2}:{quantity2},...
    const itemsParam = items.map(item => {
      // Extraer solo el número del variantId si está en formato de GraphQL
      const variantIdLimpio = item.variantId.includes('/')
        ? item.variantId.split('/').pop() || item.variantId
        : item.variantId;
      
      return `${variantIdLimpio}:${item.quantity || 1}`;
    }).join(',');
    
    return `${CHECKOUT_URL}/${itemsParam}`;
  } catch (error) {
    console.error('Error al generar URL de checkout múltiple:', error);
    return CHECKOUT_URL;
  }
}