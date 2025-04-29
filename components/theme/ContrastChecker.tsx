import React from 'react';
import { evaluateColorContrast } from '@/utils/colorContrast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Check, AlertTriangle, X, AlertCircle, Info } from 'lucide-react';

interface ContrastCheckerProps {
  color: string;
  appearance: 'dark' | 'light';
}

const getRatingIcon = (rating: string) => {
  switch (rating) {
    case 'excellent':
      return <Check className="h-4 w-4 text-green-500" />;
    case 'good':
      return <Check className="h-4 w-4 text-emerald-500" />;
    case 'moderate':
      return <AlertTriangle className="h-4 w-4 text-amber-500" />;
    case 'poor':
      return <X className="h-4 w-4 text-red-500" />;
    default:
      return <Info className="h-4 w-4" />;
  }
};

const getRatingText = (rating: string) => {
  switch (rating) {
    case 'excellent':
      return 'Excelente';
    case 'good':
      return 'Bueno';
    case 'moderate':
      return 'Moderado';
    case 'poor':
      return 'Pobre';
    default:
      return 'Desconocido';
  }
};

const getRatingColor = (rating: string) => {
  switch (rating) {
    case 'excellent':
      return 'bg-green-500/10 text-green-500 border-green-500/20';
    case 'good':
      return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    case 'moderate':
      return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    case 'poor':
      return 'bg-red-500/10 text-red-500 border-red-500/20';
    default:
      return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
  }
};

export const ContrastChecker: React.FC<ContrastCheckerProps> = ({ color, appearance }) => {
  const contrast = evaluateColorContrast(color);
  const relevantContrast = appearance === 'dark' ? contrast.onBlack : contrast.onWhite;
  const rating = relevantContrast.accessibility.rating;
  
  return (
    <div className="mt-4 mb-2">
      <Alert className={`${getRatingColor(rating)} border`}>
        <div className="flex items-center gap-2">
          {getRatingIcon(rating)}
          <AlertTitle>Contraste de accesibilidad: {getRatingText(rating)}</AlertTitle>
        </div>
        <AlertDescription className="mt-2">
          <div className="flex flex-col gap-1.5">
            <div className="text-xs">
              Relación de contraste: <strong>{relevantContrast.contrast.toFixed(2)}:1</strong>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {relevantContrast.accessibility.isAAA ? (
                <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                  <Check className="h-3 w-3 mr-1" /> WCAG AAA
                </Badge>
              ) : relevantContrast.accessibility.isAA ? (
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                  <Check className="h-3 w-3 mr-1" /> WCAG AA
                </Badge>
              ) : relevantContrast.accessibility.isLargeAA ? (
                <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20">
                  <AlertTriangle className="h-3 w-3 mr-1" /> Solo texto grande
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
                  <AlertCircle className="h-3 w-3 mr-1" /> No cumple WCAG
                </Badge>
              )}
            </div>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
};