import { pool, db } from '../server/db';
import { vehicles } from '../shared/schema';
import { eq, and } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

// Tipos para los datos de vehículos
interface VehicleSourceData {
  year: string;
  make: string;
  model: string;
  trim?: string;
  engine?: string;
  transmission?: string;
  bodyType?: string;
  originCountry?: string;
  isImported?: string;
  availableInMexico?: string;
  mexicanName?: string;
  fuelType?: string;
  cylinderCount?: string;
  displacement?: string;
  driveType?: string;
}

/**
 * Función para importar vehículos desde CSV
 * @param filePath Ruta al archivo CSV
 */
async function importVehiclesFromCSV(filePath: string) {
  console.log(`Importando vehículos desde ${filePath}...`);
  
  try {
    const fileContent = fs.readFileSync(path.resolve(filePath), 'utf-8');
    
    // Usar csv-parse para analizar el archivo CSV
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    }) as VehicleSourceData[];
    
    console.log(`Se encontraron ${records.length} registros para importar`);
    
    // Contador de vehículos procesados e insertados
    let processedCount = 0;
    let insertedCount = 0;
    let updatedCount = 0;
    let errorCount = 0;
    
    // Procesar cada registro del CSV
    for (const record of records) {
      try {
        processedCount++;
        
        // Validar datos obligatorios
        if (!record.year || !record.make || !record.model) {
          console.error(`Registro inválido, faltan datos obligatorios: ${JSON.stringify(record)}`);
          errorCount++;
          continue;
        }
        
        // Convertir valores de string a boolean
        const isImported = record.isImported === 'true' || record.isImported === '1';
        const availableInMexico = record.availableInMexico === 'true' || record.availableInMexico === '1';
        const cylinderCount = record.cylinderCount ? parseInt(record.cylinderCount) : null;
        
        // Verificar si el vehículo ya existe en la base de datos
        const existingVehicles = await db.select().from(vehicles)
          .where(
            and(
              eq(vehicles.year, parseInt(record.year)),
              eq(vehicles.make, record.make),
              eq(vehicles.model, record.model)
            )
          )
          .limit(1);
        
        // Si el vehículo ya existe, actualizar sus datos
        if (existingVehicles.length > 0) {
          const id = existingVehicles[0].id;
          
          await db.update(vehicles)
            .set({
              transmission: record.transmission || null,
              bodyType: record.bodyType || null,
              originCountry: record.originCountry || null,
              isImported: isImported,
              availableInMexico: availableInMexico,
              mexicanName: record.mexicanName || null,
              fuelType: record.fuelType || null,
              cylinderCount: cylinderCount,
              displacement: record.displacement || null,
              driveType: record.driveType || null,
              updatedAt: new Date()
            })
            .where(eq(vehicles.id, id));
          
          updatedCount++;
        } 
        // Si no existe, insertar un nuevo registro
        else {
          await db.insert(vehicles).values({
            year: parseInt(record.year),
            make: record.make,
            model: record.model,
            submodel: null,
            engine: record.engine || null,
            transmission: record.transmission || null,
            trim: record.trim || null,
            bodyType: record.bodyType || null,
            originCountry: record.originCountry || null,
            isImported: isImported,
            availableInMexico: availableInMexico,
            mexicanName: record.mexicanName || null,
            fuelType: record.fuelType || null,
            cylinderCount: cylinderCount,
            displacement: record.displacement || null,
            driveType: record.driveType || null
          });
          
          insertedCount++;
        }
        
        // Mostrar progreso cada 100 registros
        if (processedCount % 100 === 0) {
          console.log(`Procesados ${processedCount} de ${records.length} registros`);
        }
      } catch (error) {
        console.error(`Error procesando registro ${JSON.stringify(record)}:`, error);
        errorCount++;
      }
    }
    
    console.log(`
      Importación completada:
      - Total procesados: ${processedCount}
      - Nuevos registros: ${insertedCount}
      - Registros actualizados: ${updatedCount}
      - Errores: ${errorCount}
    `);
    
  } catch (error) {
    console.error('Error durante la importación:', error);
  } finally {
    // Cerrar la conexión a la base de datos
    await pool.end();
  }
}

// Formato esperado del CSV:
// year,make,model,trim,engine,transmission,bodyType,originCountry,isImported,availableInMexico,mexicanName,fuelType,cylinderCount,displacement,driveType
// 2023,Honda,Civic,Touring,1.5L Turbo,CVT,Sedan,Japan,false,true,,Gasolina,4,1.5L,FWD

// Ejemplo para importar vehículos
// Para ejecutar: npx tsx scripts/importVehicles.ts ./data/mexican_vehicles.csv
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Por favor, proporciona la ruta al archivo CSV');
  process.exit(1);
}

importVehiclesFromCSV(args[0])
  .catch(error => {
    console.error('Error ejecutando el script:', error);
    process.exit(1);
  });