import fetch from 'node-fetch';

/**
 * Script para probar la búsqueda de refacciones por vehículo
 */
async function testBusquedaRefacciones() {
  try {
    console.log('Iniciando prueba de búsqueda de refacciones...');
    
    // Vehículos a probar
    const vehiculos = [
      { make: 'Nissan', model: 'Versa', year: 2018 },
      { make: 'Toyota', model: 'Corolla', year: 2019 },
      { make: 'Honda', model: 'Civic', year: 2020 }
    ];
    
    // Refacciones comunes para probar
    const refacciones = [
      'Filtro de aceite',
      'Bujías',
      'Balatas'
    ];
    
    // Probar cada vehículo con cada refacción
    for (const vehiculo of vehiculos) {
      console.log(`\n===== Probando vehículo: ${vehiculo.make} ${vehiculo.model} ${vehiculo.year} =====`);
      
      for (const refaccion of refacciones) {
        console.log(`\n>> Buscando: "${refaccion}" para ${vehiculo.make} ${vehiculo.model} ${vehiculo.year}`);
        
        // Construir la URL de búsqueda REST
        const queryTexto = `${refaccion} ${vehiculo.make} ${vehiculo.model} ${vehiculo.year}`;
        
        // Simular la búsqueda que se hace en el cliente
        const response = await fetch('http://localhost:5000/api/shopify/refaccion', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            refaccion,
            marca: vehiculo.make,
            modelo: vehiculo.model,
            anio: vehiculo.year
          })
        });
        
        const data = await response.json();
        
        if (data.success && data.productos) {
          console.log(`Encontrados: ${data.productos.length} productos`);
          
          // Mostrar los primeros 2 resultados
          if (data.productos.length > 0) {
            console.log('Primeros resultados:');
            data.productos.slice(0, 2).forEach((producto: any, index: number) => {
              console.log(`${index + 1}. ${producto.title}`);
            });
            
            // Verificar si los resultados contienen el nombre del vehículo
            const resultadosRelevantes = data.productos.filter((p: any) => 
              p.title.toLowerCase().includes(vehiculo.make.toLowerCase()) ||
              p.title.toLowerCase().includes(vehiculo.model.toLowerCase()) ||
              p.description.toLowerCase().includes(vehiculo.make.toLowerCase()) ||
              p.description.toLowerCase().includes(vehiculo.model.toLowerCase())
            );
            
            const porcentajeRelevancia = (resultadosRelevantes.length / data.productos.length) * 100;
            console.log(`Relevancia para el vehículo: ${porcentajeRelevancia.toFixed(2)}% (${resultadosRelevantes.length}/${data.productos.length})`);
          }
        } else {
          console.log('Error en la búsqueda:', data.error || 'Respuesta inesperada');
        }
      }
    }
    
    console.log('\nPrueba completada');
  } catch (error) {
    console.error('Error en la prueba:', error);
  }
}

// Ejecutar la prueba
testBusquedaRefacciones();