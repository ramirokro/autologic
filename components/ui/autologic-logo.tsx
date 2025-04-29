import React from 'react';
import './autologic-logo.css'; // Importamos los estilos CSS

interface AutologicLogoProps {
  className?: string;
  style?: React.CSSProperties;
  animated?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

const AutologicLogo: React.FC<AutologicLogoProps> = ({ 
  className = "", 
  style,
  animated = true,
  size = 'md'
}) => {
  if (animated) {
    return (
      <div 
        className={`terminal-logo size-${size} ${className}`}
        style={style}
      >
        <div className="bars">
          <span className="bar bar1"></span>
          <span className="bar bar2"></span>
          <span className="bar bar3"></span>
        </div>
        <div className="typewriter">
          <span className="text">autologic</span><span className="cursor">_</span>
        </div>
      </div>
    );
  }

  // Versión estática del logo para cuando no se quiere animación
  return (
    <img 
      src="/logo-autologic-green.png" 
      alt="Autologic Logo" 
      className={className}
      style={{ ...style, objectFit: "contain" }}
    />
  );
};

export default AutologicLogo;