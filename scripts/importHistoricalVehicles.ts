/**
 * Script para importar vehículos históricos (1990-2020) a la base de datos
 */
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';
import { db } from '../server/db';
import { vehicles } from '../shared/schema';
import { eq, and } from 'drizzle-orm';

async function importHistoricalVehicles() {
  try {
    // Leer archivo CSV
    const filePath = path.resolve(process.cwd(), 'data/historical_vehicles.csv');
    const fileContent = fs.readFileSync(filePath, 'utf-8');

    // Parsear CSV
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
    });

    console.log(`Leyendo ${records.length} registros de vehículos históricos...`);

    // Estadísticas de importación
    let created = 0;
    let updated = 0;
    let skipped = 0;
    let errors = 0;

    // Procesar cada registro
    for (const record of records) {
      try {
        // Convertir valores según sea necesario
        const vehicleData = {
          year: parseInt(record.year),
          make: record.make?.trim(),
          model: record.model?.trim(),
          engine: record.engine?.trim(),
          originCountry: record.originCountry?.trim(),
          isImported: record.isImported === 'true',
        };

        // Verificar datos obligatorios
        if (!vehicleData.year || !vehicleData.make || !vehicleData.model) {
          console.warn('Vehículo con datos incompletos, saltando:', vehicleData);
          skipped++;
          continue;
        }

        // Comprobar si el vehículo ya existe
        const existingVehicle = await db.select()
          .from(vehicles)
          .where(
            and(
              eq(vehicles.year, vehicleData.year),
              eq(vehicles.make, vehicleData.make),
              eq(vehicles.model, vehicleData.model),
              eq(vehicles.engine, vehicleData.engine || '')
            )
          );

        if (existingVehicle.length > 0) {
          // Actualizar vehículo
          const result = await db.update(vehicles)
            .set(vehicleData)
            .where(eq(vehicles.id, existingVehicle[0].id))
            .returning();
          
          if (result && result.length > 0) {
            updated++;
          }
        } else {
          // Crear nuevo vehículo
          const result = await db.insert(vehicles)
            .values(vehicleData)
            .returning();
          
          if (result && result.length > 0) {
            created++;
          }
        }

      } catch (err) {
        console.error('Error procesando vehículo:', record, err);
        errors++;
      }
    }

    // Mostrar resumen
    console.log('==== Resumen de importación ====');
    console.log(`Vehículos creados: ${created}`);
    console.log(`Vehículos actualizados: ${updated}`);
    console.log(`Vehículos omitidos: ${skipped}`);
    console.log(`Errores: ${errors}`);
    console.log('===============================');

  } catch (err) {
    console.error('Error durante la importación:', err);
  } finally {
    // Cerrar la conexión a la base de datos al finalizar
    try {
      // En drizzle-orm el cliente se accede mediante $client
      await db.$client.end();
    } catch (err) {
      console.error('Error al cerrar la conexión:', err);
    }
  }
}

// Ejecutar función de importación
importHistoricalVehicles().then(() => {
  console.log('Proceso de importación completado');
});