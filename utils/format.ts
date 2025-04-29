/**
 * Formatea la duración de un video en segundos a un formato legible
 * @param seconds Duración en segundos
 * @returns Texto formateado (ejm: "5:30", "1:30:45")
 */
export function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return '0:00';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Formatea una fecha para mostrarla en un formato amigable
 * @param date Fecha a formatear
 * @returns Texto formateado (ejm: "10 abril, 2023")
 */
export function formatDate(date: Date | string | null): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return dateObj.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

/**
 * Formatea un precio para mostrarlo con formato de moneda
 * @param price Precio a formatear
 * @param currency Símbolo de moneda (por defecto '$')
 * @returns Texto formateado (ejm: "$10.99")
 */
export function formatPrice(price: number, currency: string = '$'): string {
  return `${currency}${price.toFixed(2)}`;
}