import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Producto } from './shopify';
import { auth, db, storage } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { VehiculoContexto } from './contextManager';

/**
 * Interfaz para el vehículo simplificada (para compatibilidad)
 */
interface Vehiculo {
  marca?: string;
  modelo?: string;
  anio?: number;
  vin?: string;
}

/**
 * Interfaz para el documento de diagnóstico
 */
interface DiagnosticoDoc {
  uid: string;
  vehiculoInfo: {
    marca: string;
    modelo: string;
    anio: number;
    vin?: string;
    motor?: string;
    kilometraje?: number;
  };
  diagnosticoGeneral: string;
  recomendaciones: string[];
  refacciones: Producto[];
  fecha: Date;
  pdfUrl?: string;
}

/**
 * Función para convertir la información de contexto del vehículo a formato simple
 * @param vehiculoContexto Información contextual del vehículo
 */
function convertirVehiculoContexto(vehiculoContexto: VehiculoContexto): Vehiculo {
  return {
    marca: vehiculoContexto.make,
    modelo: vehiculoContexto.model,
    anio: vehiculoContexto.year,
    // Si hay más campos, se agregarían aquí
  };
}

/**
 * Guarda el diagnóstico en Firestore y sube el PDF a Storage
 * @param diagnosticoData Datos del diagnóstico
 * @param pdfBlob Blob del PDF generado
 * @returns URL de descarga del PDF o undefined si falla
 */
async function guardarDiagnosticoYPDF(diagnosticoData: DiagnosticoDoc, pdfBlob: Blob): Promise<string | undefined> {
  try {
    if (!auth.currentUser) {
      console.warn('No hay usuario autenticado para guardar el diagnóstico');
      return undefined;
    }

    // 1. Subir el PDF a Storage
    const pdfFileName = `diagnosticos/${auth.currentUser.uid}/${Date.now()}_diagnostico.pdf`;
    const storageRef = ref(storage, pdfFileName);
    
    const uploadResult = await uploadBytes(storageRef, pdfBlob);
    console.log('PDF subido correctamente:', uploadResult.metadata.name);
    
    // 2. Obtener la URL de descarga
    const downloadURL = await getDownloadURL(storageRef);
    
    // 3. Actualizar el documento con la URL
    diagnosticoData.pdfUrl = downloadURL;
    
    // 4. Guardar en Firestore
    const diagnosticosRef = collection(db, 'diagnosticos');
    await addDoc(diagnosticosRef, {
      ...diagnosticoData,
      createdAt: serverTimestamp()
    });
    
    console.log('Diagnóstico guardado correctamente en Firestore');
    return downloadURL;
  } catch (error) {
    console.error('Error al guardar el diagnóstico:', error);
    return undefined;
  }
}

/**
 * Genera un PDF con el diagnóstico y las refacciones recomendadas (versión original para compatibilidad)
 * @param diagnostico Texto del diagnóstico
 * @param refacciones Productos recomendados
 * @param vehiculo Información del vehículo
 */
export function generarPDFDiagnostico(
  diagnostico: string,
  refacciones: Producto[],
  vehiculo: Vehiculo
): void {
  // Esta función mantiene compatibilidad con el código existente
  // Ahora llamamos a la versión profesional
  generarPDFDiagnosticoProfesional(diagnostico, refacciones, vehiculo, false);
}

/**
 * Genera un PDF profesional con el diagnóstico y las refacciones recomendadas
 * @param diagnostico Texto del diagnóstico
 * @param refacciones Productos recomendados
 * @param vehiculo Información del vehículo
 * @param guardarEnFirebase Si es true, guarda el PDF en Firebase
 * @returns Promise con la URL del PDF si se guardó, undefined en caso contrario
 */
export async function generarPDFDiagnosticoProfesional(
  diagnostico: string,
  refacciones: Producto[],
  vehiculo: Vehiculo | VehiculoContexto,
  guardarEnFirebase: boolean = true
): Promise<string | undefined> {
  // Asegurar que tenemos un objeto Vehiculo estándar
  const vehiculoObj: Vehiculo = 'make' in vehiculo ? 
    convertirVehiculoContexto(vehiculo as VehiculoContexto) : 
    vehiculo as Vehiculo;
  
  // Crear un nuevo documento PDF
  const doc = new jsPDF();
  const fecha = new Date();
  const fechaActual = fecha.toLocaleDateString();
  const total = refacciones.reduce((sum, r) => sum + parseFloat(r.price || "0"), 0);

  // LOGO Autologic - Cargar el logotipo desde la carpeta public
  try {
    const logoSrc = '/logo-autologic.png';
    doc.addImage(logoSrc, 'PNG', 150, 10, 40, 20);
  } catch (error) {
    console.warn('No se pudo cargar el logo:', error);
    // Continuamos sin el logo
  }

  // Título y encabezado
  doc.setFontSize(16);
  doc.text("Reporte de Diagnóstico - Autologic", 10, 20);
  doc.setFontSize(11);
  doc.text(`Fecha: ${fechaActual}`, 10, 30);
  
  // Información del vehículo
  const vehiculoInfo = vehiculoObj.marca && vehiculoObj.modelo && vehiculoObj.anio 
    ? `${vehiculoObj.marca} ${vehiculoObj.modelo} ${vehiculoObj.anio}` 
    : 'Información no disponible';
  doc.text(`Vehículo: ${vehiculoInfo}`, 10, 38);

  // Diagnóstico técnico
  doc.setFontSize(13);
  doc.text("Diagnóstico:", 10, 50);
  doc.setFontSize(11);
  
  // Dividir el texto del diagnóstico en líneas para que se ajuste a la página
  const diagnosticoLineas = doc.splitTextToSize(diagnostico, 180);
  doc.text(diagnosticoLineas, 10, 58);

  // Tabla de refacciones
  if (refacciones.length > 0) {
    const rows = refacciones.map((r) => [
      r.title || 'Sin nombre', 
      `$${parseFloat(r.price || "0").toFixed(2)}`
    ]);
    
    // Usar autoTable para generar la tabla de refacciones
    autoTable(doc, {
      startY: 80,
      head: [["Refacción", "Precio"]],
      body: rows,
      theme: "grid",
      headStyles: { fillColor: [22, 108, 177] },
    });

    // Total estimado
    doc.setFontSize(12);
    
    // La posición y final después de la tabla 
    // Nota: lastAutoTable es una propiedad añadida por jspdf-autotable, 
    // necesitamos tratar doc como any para acceder a ella
    const finalY = (doc as any).lastAutoTable?.finalY || 100;
    doc.text(`Total estimado: $${total.toFixed(2)} MXN`, 10, finalY + 10);

    // Generar código QR para contacto directo o carrito de compra
    try {
      // Generar URL para el código QR - puede ser contacto de WhatsApp o enlace al carrito
      const qrDataUrl = refacciones.length > 0 
        ? `https://api.qrserver.com/v1/create-qr-code/?data=https://autologic.mx/cart&size=100x100` 
        : `https://api.qrserver.com/v1/create-qr-code/?data=https://wa.me/521XXXXXXXXXX&size=100x100`;
      
      doc.addImage(qrDataUrl, "PNG", 150, finalY + 5, 40, 40);
      doc.setFontSize(10);
      doc.text("Escanea para proceder a compra", 150, finalY + 50);
    } catch (error) {
      console.warn('No se pudo cargar el código QR:', error);
      // Continuamos sin el QR
    }
  } else {
    // Si no hay refacciones recomendadas
    doc.setFontSize(12);
    doc.text('No hay refacciones específicas recomendadas para este diagnóstico.', 10, 90);
  }

  // Firma OBi-2
  doc.setFontSize(10);
  doc.text("Este reporte fue generado por OBi-2, Asistente IA de Autologic.mx", 10, 285);

  // Generar nombre del archivo
  const nombre = vehiculoObj.marca && vehiculoObj.modelo
    ? `diagnostico_${vehiculoObj.marca}_${vehiculoObj.modelo}_${vehiculoObj.anio || 'vehiculo'}.pdf`
    : 'diagnostico_vehiculo.pdf';
  
  // Si no estamos guardando en Firebase, simplemente descargamos el PDF
  if (!guardarEnFirebase || !auth.currentUser) {
    doc.save(nombre);
    return undefined;
  }
  
  // Guardar en Firebase Storage y Firestore
  try {
    // Convertir el PDF a Blob
    const pdfBlob = doc.output('blob');
    
    // Preparar los datos para Firestore
    const vehiculoInfo = {
      marca: vehiculoObj.marca || '',
      modelo: vehiculoObj.modelo || '',
      anio: vehiculoObj.anio || 0,
      vin: vehiculoObj.vin || '',
    };
    
    // Crear el documento para Firebase
    const diagnosticoDoc: DiagnosticoDoc = {
      uid: auth.currentUser.uid,
      vehiculoInfo,
      diagnosticoGeneral: diagnostico,
      recomendaciones: [],
      refacciones,
      fecha,
    };
    
    // Guardar el diagnóstico y el PDF
    return await guardarDiagnosticoYPDF(diagnosticoDoc, pdfBlob);
  } catch (error) {
    console.error('Error al guardar el PDF:', error);
    // Si hay error, al menos permitir la descarga local
    doc.save(nombre);
    return undefined;
  }
}

/**
 * Genera un PDF con el diagnóstico mejorado y las refacciones recomendadas
 * @param diagnosticoGeneral Texto del diagnóstico general
 * @param recomendaciones Lista de recomendaciones específicas
 * @param refacciones Productos recomendados
 * @param vehiculo Información del vehículo
 * @param guardarEnFirebase Si es true, guarda el PDF en Firebase
 * @returns Promise con la URL del PDF si se guardó, undefined en caso contrario
 */
export async function generarPDFDiagnosticoMejorado(
  diagnosticoGeneral: string,
  recomendaciones: string[] = [],
  refacciones: Producto[],
  vehiculo: Vehiculo | VehiculoContexto,
  guardarEnFirebase: boolean = true
): Promise<string | undefined> {
  // Asegurar que tenemos un objeto Vehiculo estándar
  const vehiculoObj: Vehiculo = 'make' in vehiculo ? 
    convertirVehiculoContexto(vehiculo as VehiculoContexto) : 
    vehiculo as Vehiculo;
  
  // Crear un nuevo documento PDF
  const doc = new jsPDF();
  const fecha = new Date();
  
  // Configurar estilo base
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  
  // Logo y título
  doc.setTextColor(0, 100, 0); // Verde oscuro para OBi-2
  doc.text('Reporte de Diagnóstico Automotriz', 14, 20);
  
  // Subtítulo de OBi-2
  doc.setFontSize(14);
  doc.text('Generado por OBi-2 - Asistente Técnico Autologic', 14, 28);
  
  // Fecha actual
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  const fechaActual = fecha.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  doc.text(`Fecha: ${fechaActual}`, 14, 36);
  
  // Separador principal
  doc.setDrawColor(0, 100, 0); // Verde oscuro
  doc.setLineWidth(0.5);
  doc.line(14, 40, 196, 40);
  
  // SECCIÓN 1: INFORMACIÓN DEL VEHÍCULO
  doc.setTextColor(0, 100, 0);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('INFORMACIÓN DEL VEHÍCULO', 14, 50);
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  let vehiculoInfo = '';
  
  if (vehiculoObj.marca && vehiculoObj.modelo && vehiculoObj.anio) {
    vehiculoInfo = `Marca: ${vehiculoObj.marca}\nModelo: ${vehiculoObj.modelo}\nAño: ${vehiculoObj.anio}`;
  } else {
    vehiculoInfo = 'Información no disponible';
  }
  
  if (vehiculoObj.vin) {
    vehiculoInfo += `\nVIN: ${vehiculoObj.vin}`;
  }
  
  // Dibujar recuadro para información del vehículo
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.2);
  doc.roundedRect(14, 53, 182, 25, 3, 3);
  
  doc.text(vehiculoInfo, 20, 60);
  
  // SECCIÓN 2: DIAGNÓSTICO GENERAL
  doc.setTextColor(0, 100, 0);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('DIAGNÓSTICO GENERAL', 14, 90);
  
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  
  // Dibujar recuadro para diagnóstico
  doc.setDrawColor(220, 220, 220);
  doc.roundedRect(14, 93, 182, 50, 3, 3);
  
  // Dividir el texto del diagnóstico en líneas
  const diagnosticoLineas = doc.splitTextToSize(diagnosticoGeneral, 170);
  doc.text(diagnosticoLineas, 20, 100);
  
  // SECCIÓN 3: RECOMENDACIONES TÉCNICAS
  let yPos = 155; // Posición inicial después del diagnóstico
  
  doc.setTextColor(0, 100, 0);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('RECOMENDACIONES TÉCNICAS', 14, yPos);
  
  yPos += 5;
  
  // Dibujar recuadro para recomendaciones
  doc.setDrawColor(220, 220, 220);
  doc.roundedRect(14, yPos, 182, 40, 3, 3);
  
  yPos += 10;
  
  // Recomendaciones Técnicas
  if (recomendaciones.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text('No hay recomendaciones técnicas específicas.', 20, yPos);
  } else {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    
    recomendaciones.forEach((recomendacion, index) => {
      // Si nos pasamos de la página, añadir una nueva
      if (yPos > 270) {
        doc.addPage();
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.setTextColor(0, 100, 0);
        doc.text('RECOMENDACIONES TÉCNICAS (continuación)', 14, 20);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        yPos = 30;
      }
      
      const bullet = `${index + 1}.`;
      doc.setFont('helvetica', 'bold');
      doc.text(bullet, 20, yPos);
      
      doc.setFont('helvetica', 'normal');
      const recomendacionLineas = doc.splitTextToSize(recomendacion, 160);
      doc.text(recomendacionLineas, 30, yPos);
      
      // Avanzar la posición Y
      yPos += recomendacionLineas.length * 6 + 5;
    });
  }
  
  // SECCIÓN 4: REFACCIONES RECOMENDADAS
  yPos = Math.min(yPos + 15, 210); // Limitar el avance para dejar espacio para refacciones
  
  doc.setTextColor(0, 100, 0);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('REFACCIONES RECOMENDADAS', 14, yPos);
  
  yPos += 8;
  
  // Verificar si hay refacciones
  if (refacciones.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text('No se recomendaron refacciones específicas.', 14, yPos);
  } else {
    // Nueva página para refacciones si estamos muy abajo
    if (yPos > 230) {
      doc.addPage();
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(0, 100, 0);
      doc.text('REFACCIONES RECOMENDADAS', 14, 20);
      yPos = 30;
    }
    
    // Dibujar cada refacción
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    
    refacciones.forEach((refaccion, index) => {
      // Si nos pasamos de la página, añadir una nueva
      if (yPos > 250) {
        doc.addPage();
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.setTextColor(0, 100, 0);
        doc.text('REFACCIONES RECOMENDADAS (continuación)', 14, 20);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        yPos = 30;
      }
      
      // Recuadro para cada refacción
      doc.setDrawColor(235, 235, 235);
      doc.roundedRect(14, yPos - 5, 182, 22, 2, 2);
      
      // Número y nombre del producto
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(50, 50, 50);
      doc.text(`${index + 1}. ${refaccion.title}`, 18, yPos);
      
      // Precio
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(180, 0, 0); // Rojo suave para el precio
      const precio = parseFloat(refaccion.price) > 0 
        ? `$${parseFloat(refaccion.price).toFixed(2)} MXN` 
        : 'Precio a consultar';
      
      doc.text(`Precio: ${precio}`, 18, yPos + 7);
      
      // Link a la tienda
      if (refaccion.handle) {
        doc.setTextColor(0, 0, 205); // Azul para el link
        doc.setFont('helvetica', 'italic');
        const urlProducto = `carperautopartes.com/products/${refaccion.handle}`;
        doc.text(`Ver en tienda: ${urlProducto}`, 120, yPos + 7);
      }
      
      // Avanzar la posición Y
      yPos += 25;
    });
  }
  
  // PIE DE PÁGINA
  // En todas las páginas
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    
    const finalY = 280;
    
    // Separador de pie de página
    doc.setDrawColor(0, 100, 0);
    doc.setLineWidth(0.5);
    doc.line(14, finalY - 10, 196, finalY - 10);
    
    // Texto de pie de página
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text('© Autologic - Asistencia técnica automotriz especializada', 14, finalY - 5);
    doc.text(`Página ${i} de ${totalPages}`, 196, finalY - 5, { align: 'right' });
    doc.text('carperautopartes.com', 105, finalY, { align: 'center' });
  }
  
  // Generar el nombre del archivo
  const nombre = vehiculoObj.modelo ? 
    `diagnostico_${vehiculoObj.marca}_${vehiculoObj.modelo}_${vehiculoObj.anio || 'vehiculo'}.pdf` : 
    'diagnostico_vehiculo.pdf';
  
  // Si no estamos guardando en Firebase, simplemente descargamos el PDF
  if (!guardarEnFirebase || !auth.currentUser) {
    doc.save(nombre);
    return undefined;
  }
  
  // Guardar en Firebase Storage y Firestore
  try {
    // Convertir el PDF a Blob
    const pdfBlob = doc.output('blob');
    
    // Preparar los datos para Firestore
    const vehiculoInfo = {
      marca: vehiculoObj.marca || '',
      modelo: vehiculoObj.modelo || '',
      anio: vehiculoObj.anio || 0,
      vin: vehiculoObj.vin || '',
    };
    
    // Crear el documento para Firebase
    const diagnosticoDoc: DiagnosticoDoc = {
      uid: auth.currentUser.uid,
      vehiculoInfo,
      diagnosticoGeneral,
      recomendaciones,
      refacciones,
      fecha,
    };
    
    // Guardar el diagnóstico y el PDF
    return await guardarDiagnosticoYPDF(diagnosticoDoc, pdfBlob);
  } catch (error) {
    console.error('Error al guardar el PDF:', error);
    // Si hay error, al menos permitir la descarga local
    doc.save(nombre);
    return undefined;
  }
}