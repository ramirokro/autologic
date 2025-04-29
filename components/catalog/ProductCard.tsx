import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircleIcon, BarChart2Icon } from 'lucide-react';
import { IProduct } from '@/lib/types';
import { Link } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Product } from '@shared/schema';
import { AddToCompareButton } from '@/components/product/ProductCompare';

interface ProductCardProps {
  product: IProduct;
  isCompatible?: boolean;
}

export default function ProductCard({ product, isCompatible = true }: ProductCardProps) {
  const { toast } = useToast();
  const [isHovered, setIsHovered] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    toast({
      title: "Producto agregado",
      description: `${product.title} se ha agregado al carrito.`,
    });
  };

  const stockLabel = product.inStock ? (
    <div className="absolute top-2 right-2 bg-green-600 text-white text-xs px-2 py-1 rounded">
      En stock
    </div>
  ) : (
    <div className="absolute top-2 right-2 bg-amber-500 text-white text-xs px-2 py-1 rounded">
      Bajo pedido
    </div>
  );

  return (
    <Link href={`/product/${product.id}`}>
      <a className="block">
        <Card 
          className="overflow-hidden transition hover:shadow-md h-full"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="relative">
            <img 
              src={product.images[0] || 'https://via.placeholder.com/300x200?text=Sin+Imagen'} 
              alt={product.title} 
              className="w-full h-48 object-cover transition-transform duration-300"
              style={{ transform: isHovered ? 'scale(1.05)' : 'scale(1)' }}
            />
            {stockLabel}
          </div>
          
          <CardContent className="p-4">
            <div className="text-xs text-neutral-500 mb-1">SKU: {product.sku}</div>
            <h3 className="font-medium text-lg mb-1 line-clamp-1">{product.title}</h3>
            
            <div className="flex items-center mb-2">
              <div className="text-sm text-neutral-600">{product.brand}</div>
              <div className="mx-2 text-neutral-300">|</div>
              <div className="text-sm text-neutral-600">{product.category}</div>
            </div>
            
            <p className="text-sm text-neutral-600 mb-3 line-clamp-2">
              {product.description}
            </p>
            
            <div className="flex justify-between items-center">
              <div className="font-semibold text-lg">${product.price.toFixed(2)}</div>
              <Button 
                onClick={handleAddToCart}
                size="sm"
                className="bg-primary hover:bg-primary/90 text-white"
              >
                Agregar
              </Button>
            </div>
            
            {isCompatible && (
              <div className="mt-3 flex items-center text-xs bg-neutral-100 rounded p-2">
                <CheckCircleIcon className="text-green-600 mr-1 h-4 w-4" />
                <span>Compatible con tu vehículo</span>
              </div>
            )}

            {/* Botón para añadir a la comparación */}
            <div 
              className="mt-3 border-t pt-3"
              onClick={(e) => e.stopPropagation()}
            >
              <AddToCompareButton product={product as unknown as Product} />
            </div>
          </CardContent>
        </Card>
      </a>
    </Link>
  );
}
