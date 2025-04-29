import { useState } from 'react';
import { useVehicle } from '@/hooks/use-vehicle';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { IProductDetails } from '@/lib/types';
import { 
  CheckCircleIcon, 
  ShoppingCartIcon, 
  HeartIcon,
  TruckIcon,
  ShieldCheckIcon,
  StoreIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from 'lucide-react';
import CompatibilityTable from './CompatibilityTable';

interface ProductDetailProps {
  product: IProductDetails;
}

export default function ProductDetail({ product }: ProductDetailProps) {
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const { selectedVehicle } = useVehicle();
  const { toast } = useToast();
  
  const isCompatible = !!selectedVehicle && product.compatibleVehicles.some(
    vehicle => 
      vehicle.year === selectedVehicle.year && 
      vehicle.make === selectedVehicle.make && 
      vehicle.model === selectedVehicle.model &&
      (
        !selectedVehicle.engine || 
        !vehicle.engine || 
        vehicle.engine === selectedVehicle.engine
      )
  );
  
  const handleAddToCart = () => {
    toast({
      title: "Producto agregado al carrito",
      description: `${quantity} unidades de ${product.title} agregadas al carrito.`,
    });
  };
  
  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };
  
  const handleImageChange = (index: number) => {
    setActiveImageIndex(index);
  };
  
  const nextImage = () => {
    setActiveImageIndex((activeImageIndex + 1) % product.images.length);
  };
  
  const prevImage = () => {
    setActiveImageIndex((activeImageIndex - 1 + product.images.length) % product.images.length);
  };
  
  return (
    <div className="flex flex-col">
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        {/* Product Gallery */}
        <div className="md:w-1/2">
          <div className="bg-neutral-100 rounded-lg mb-3 relative">
            <img 
              src={product.images[activeImageIndex] || 'https://via.placeholder.com/600x400?text=Sin+Imagen'} 
              alt={product.title} 
              className="w-full h-80 object-contain p-4"
            />
            
            {product.images.length > 1 && (
              <>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                  onClick={prevImage}
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                  onClick={nextImage}
                >
                  <ChevronRightIcon className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
          
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((image, index) => (
                <div 
                  key={index}
                  className={`
                    bg-neutral-100 rounded-lg cursor-pointer border-2
                    ${index === activeImageIndex ? 'border-primary' : 'border-transparent hover:border-neutral-300'}
                  `}
                  onClick={() => handleImageChange(index)}
                >
                  <img 
                    src={image} 
                    alt={`${product.title} - Imagen ${index + 1}`} 
                    className="h-20 w-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Product Info */}
        <div className="md:w-1/2">
          <div className="text-sm text-neutral-500 mb-1">SKU: {product.sku}</div>
          <h2 className="text-2xl font-semibold mb-2">{product.title}</h2>
          
          <div className="flex items-center mb-3">
            <Badge variant="secondary" className="bg-primary/10 text-primary mr-2">
              {product.brand}
            </Badge>
            <Badge variant="secondary" className="bg-neutral-800/10 text-neutral-800">
              {product.category}
            </Badge>
          </div>
          
          <div className="text-2xl font-bold mb-4">${product.price.toFixed(2)}</div>
          
          {selectedVehicle && (
            <Card className="bg-neutral-100 p-3 mb-4 flex items-center">
              {isCompatible ? (
                <>
                  <CheckCircleIcon className="text-green-600 h-5 w-5 mr-2" />
                  <div>
                    <div className="font-medium">Compatible con tu vehículo</div>
                    <div className="text-sm text-neutral-600">
                      {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}
                      {selectedVehicle.engine && ` • ${selectedVehicle.engine}`}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-amber-600 font-medium">
                  Este producto no es compatible con tu vehículo seleccionado.
                </div>
              )}
            </Card>
          )}
          
          <div className="border-t border-b border-neutral-200 py-4 my-4">
            <h3 className="font-medium mb-2">Descripción</h3>
            <p className="text-neutral-600 text-sm whitespace-pre-line">
              {product.description}
            </p>
          </div>
          
          <div className="mb-4">
            <h3 className="font-medium mb-2">Cantidad</h3>
            <div className="flex items-center border border-neutral-300 rounded-md inline-flex">
              <Button 
                variant="ghost"
                className="px-3 py-1 h-auto border-r border-neutral-300 rounded-none"
                onClick={() => handleQuantityChange(quantity - 1)}
              >
                -
              </Button>
              <Input
                type="number"
                value={quantity}
                onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                className="w-16 text-center border-none focus-visible:ring-0"
                min={1}
              />
              <Button 
                variant="ghost"
                className="px-3 py-1 h-auto border-l border-neutral-300 rounded-none"
                onClick={() => handleQuantityChange(quantity + 1)}
              >
                +
              </Button>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <Button 
              className="bg-primary hover:bg-primary/90 text-white flex-grow flex items-center justify-center"
              onClick={handleAddToCart}
            >
              <ShoppingCartIcon className="mr-2 h-4 w-4" />
              Agregar al carrito
            </Button>
            <Button variant="outline" size="icon">
              <HeartIcon className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="mt-6 space-y-2">
            <div className="text-sm flex items-center">
              <TruckIcon className="mr-2 h-4 w-4 text-neutral-600" />
              <span>Envío gratis en pedidos mayores a $2,500</span>
            </div>
            <div className="text-sm flex items-center">
              <ShieldCheckIcon className="mr-2 h-4 w-4 text-neutral-600" />
              <span>Garantía de 12 meses</span>
            </div>
            <div className="text-sm flex items-center">
              <StoreIcon className="mr-2 h-4 w-4 text-neutral-600" />
              <span>Disponible en tienda para recoger</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Compatibility Table */}
      <div className="mt-8 border-t border-neutral-200 pt-6">
        <h3 className="font-semibold text-lg mb-4">Tabla de compatibilidad vehicular</h3>
        <CompatibilityTable vehicles={product.compatibleVehicles} />
      </div>
      
      {/* Technical Specifications */}
      <div className="mt-8 border-t border-neutral-200 pt-6">
        <h3 className="font-semibold text-lg mb-4">Especificaciones técnicas</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-neutral-50 p-4">
            <h4 className="font-medium text-sm mb-2">Detalles del producto</h4>
            <table className="w-full text-sm">
              <tbody>
                <tr>
                  <td className="py-1 text-neutral-600">Marca:</td>
                  <td className="py-1 font-medium">{product.brand}</td>
                </tr>
                <tr>
                  <td className="py-1 text-neutral-600">Número de parte:</td>
                  <td className="py-1 font-medium">{product.sku}</td>
                </tr>
                <tr>
                  <td className="py-1 text-neutral-600">Categoría:</td>
                  <td className="py-1 font-medium">{product.category}</td>
                </tr>
                <tr>
                  <td className="py-1 text-neutral-600">Garantía:</td>
                  <td className="py-1 font-medium">12 meses</td>
                </tr>
                <tr>
                  <td className="py-1 text-neutral-600">Disponibilidad:</td>
                  <td className="py-1 font-medium">
                    {product.inStock ? 'En stock' : 'Bajo pedido'}
                  </td>
                </tr>
              </tbody>
            </table>
          </Card>
          
          <Card className="bg-neutral-50 p-4">
            <h4 className="font-medium text-sm mb-2">Dimensiones y peso</h4>
            <table className="w-full text-sm">
              <tbody>
                <tr>
                  <td className="py-1 text-neutral-600">Dimensiones:</td>
                  <td className="py-1 font-medium">N/A</td>
                </tr>
                <tr>
                  <td className="py-1 text-neutral-600">Peso:</td>
                  <td className="py-1 font-medium">N/A</td>
                </tr>
                <tr>
                  <td className="py-1 text-neutral-600">Material:</td>
                  <td className="py-1 font-medium">N/A</td>
                </tr>
                <tr>
                  <td className="py-1 text-neutral-600">País de origen:</td>
                  <td className="py-1 font-medium">N/A</td>
                </tr>
                <tr>
                  <td className="py-1 text-neutral-600">Posición:</td>
                  <td className="py-1 font-medium">N/A</td>
                </tr>
              </tbody>
            </table>
          </Card>
        </div>
        
        <div className="mt-4 text-center">
          <Button variant="link" className="text-blue-600">
            <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M10 9H9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Descargar ficha técnica (PDF)
          </Button>
        </div>
      </div>
    </div>
  );
}
