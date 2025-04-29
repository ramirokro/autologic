/**
 * Utilidades para calcular contraste de colores y verificar accesibilidad
 * Basado en las directrices WCAG 2.1
 */

/**
 * Convierte un color HSL a RGB
 * @param h Matiz (0-360)
 * @param s Saturación (0-100)
 * @param l Luminosidad (0-100)
 * @returns Array con valores RGB (0-255)
 */
export function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  // Convertir a valores entre 0 y 1
  h /= 360;
  s /= 100;
  l /= 100;

  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

/**
 * Parsea una cadena de color HSL
 * @param hslStr Color en formato HSL "hsl(0, 0%, 0%)"
 * @returns Array con valores [h, s, l]
 */
export function parseHsl(hslStr: string): [number, number, number] {
  // Extraer valores numéricos de la cadena HSL
  const match = hslStr.match(/hsl\(\s*(\d+),\s*(\d+)%,\s*(\d+)%\)/);
  
  if (!match) {
    throw new Error(`No se pudo parsear el color HSL: ${hslStr}`);
  }
  
  return [
    Number(match[1]), // Hue (0-360)
    Number(match[2]), // Saturation (0-100)
    Number(match[3])  // Lightness (0-100)
  ];
}

/**
 * Calcula la luminancia relativa de un color
 * Fórmula basada en WCAG 2.1
 * @param r Rojo (0-255)
 * @param g Verde (0-255)
 * @param b Azul (0-255)
 * @returns Luminancia relativa (0-1)
 */
export function calculateRelativeLuminance(r: number, g: number, b: number): number {
  // Normalizar RGB a valores entre 0 y 1
  const sR = r / 255;
  const sG = g / 255;
  const sB = b / 255;
  
  // Convertir a espacio lineal
  const R = sR <= 0.03928 ? sR / 12.92 : Math.pow((sR + 0.055) / 1.055, 2.4);
  const G = sG <= 0.03928 ? sG / 12.92 : Math.pow((sG + 0.055) / 1.055, 2.4);
  const B = sB <= 0.03928 ? sB / 12.92 : Math.pow((sB + 0.055) / 1.055, 2.4);
  
  // Calcular luminancia usando fórmula WCAG
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

/**
 * Calcula el contraste entre dos colores
 * @param hsl1 Primer color en formato HSL "hsl(0, 0%, 0%)"
 * @param hsl2 Segundo color en formato HSL "hsl(0, 0%, 0%)"
 * @returns Relación de contraste (1-21)
 */
export function calculateContrast(hsl1: string, hsl2: string): number {
  // Parsear colores HSL
  const [h1, s1, l1] = parseHsl(hsl1);
  const [h2, s2, l2] = parseHsl(hsl2);
  
  // Convertir a RGB
  const [r1, g1, b1] = hslToRgb(h1, s1, l1);
  const [r2, g2, b2] = hslToRgb(h2, s2, l2);
  
  // Calcular luminancias
  const luminance1 = calculateRelativeLuminance(r1, g1, b1);
  const luminance2 = calculateRelativeLuminance(r2, g2, b2);
  
  // Calcular contraste
  const brighter = Math.max(luminance1, luminance2);
  const darker = Math.min(luminance1, luminance2);
  
  return (brighter + 0.05) / (darker + 0.05);
}

/**
 * Verifica si el contraste cumple con los niveles de accesibilidad WCAG
 * @param contrastRatio Relación de contraste
 * @returns Objeto con niveles de accesibilidad
 */
export function checkAccessibility(contrastRatio: number): {
  isAA: boolean;
  isAAA: boolean;
  isLargeAA: boolean;
  isLargeAAA: boolean;
  rating: 'poor' | 'moderate' | 'good' | 'excellent';
} {
  return {
    // Texto normal
    isAA: contrastRatio >= 4.5,     // AA requiere 4.5:1 para texto normal
    isAAA: contrastRatio >= 7,      // AAA requiere 7:1 para texto normal
    
    // Texto grande
    isLargeAA: contrastRatio >= 3,  // AA requiere 3:1 para texto grande
    isLargeAAA: contrastRatio >= 4.5, // AAA requiere 4.5:1 para texto grande
    
    // Calificación general
    rating: 
      contrastRatio >= 7 ? 'excellent' :
      contrastRatio >= 4.5 ? 'good' :
      contrastRatio >= 3 ? 'moderate' : 'poor'
  };
}

/**
 * Calcula el contraste entre un color y fondos blanco/negro
 * @param primaryColor Color en formato HSL "hsl(0, 0%, 0%)"
 * @returns Objeto con contrastes y niveles de accesibilidad
 */
export function evaluateColorContrast(primaryColor: string): {
  onWhite: {
    contrast: number;
    accessibility: ReturnType<typeof checkAccessibility>;
  };
  onBlack: {
    contrast: number;
    accessibility: ReturnType<typeof checkAccessibility>;
  };
} {
  const whiteBackground = "hsl(0, 0%, 100%)";
  const blackBackground = "hsl(0, 0%, 0%)";
  
  const contrastOnWhite = calculateContrast(primaryColor, whiteBackground);
  const contrastOnBlack = calculateContrast(primaryColor, blackBackground);
  
  return {
    onWhite: {
      contrast: contrastOnWhite,
      accessibility: checkAccessibility(contrastOnWhite)
    },
    onBlack: {
      contrast: contrastOnBlack,
      accessibility: checkAccessibility(contrastOnBlack)
    }
  };
}

/**
 * Ajusta la luminosidad de un color HSL para mejorar el contraste
 * @param hslColor Color en formato HSL "hsl(0, 0%, 0%)"
 * @param onDark Si es verdadero, ajusta para fondo oscuro, si es falso, para fondo claro
 * @returns Color HSL ajustado
 */
export function adjustColorForContrast(hslColor: string, onDark: boolean): string {
  const [h, s, l] = parseHsl(hslColor);
  
  // Ajustar luminosidad basado en si el color estará sobre fondo oscuro o claro
  let newL = l;
  
  if (onDark) {
    // En fondos oscuros, aumentar luminosidad si es muy baja
    newL = Math.min(95, l < 50 ? l + 30 : l + 10);
  } else {
    // En fondos claros, reducir luminosidad si es muy alta
    newL = Math.max(25, l > 70 ? l - 40 : l - 15);
  }
  
  return `hsl(${h}, ${s}%, ${Math.round(newL)}%)`;
}