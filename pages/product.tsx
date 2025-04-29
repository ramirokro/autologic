import { useQuery } from '@tanstack/react-query';
import { Link, useParams, useLocation } from 'wouter';
import VehicleSelector from '@/components/vehicle/VehicleSelector';
import ProductDetail from '@/components/product/ProductDetail';
import { CompareFloatingButton } from '@/components/product/CompareFloatingButton';
import { Skeleton } from '@/components/ui/skeleton';
import { HomeIcon, AlertTriangleIcon } from 'lucide-react';

export default function Product() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  
  // Fetch product details
  const { data: product, isLoading, error } = useQuery({
    queryKey: [`/api/products/${id}`],
  });
  
  // Fetch related products
  const { data: relatedProducts } = useQuery({
    queryKey: [`/api/products/${id}/related`],
    enabled: !!product,
  });
  
  // If product not found, redirect to catalog
  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 max-w-lg mx-auto">
          <AlertTriangleIcon className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Producto no encontrado</h2>
          <p className="text-neutral-600 mb-6">
            Lo sentimos, el producto que buscas no existe o ha sido descontinuado.
          </p>
          <Link href="/catalog">
            <a className="text-primary hover:text-primary/90 font-medium">
              Volver al catálogo
            </a>
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div>
      <VehicleSelector />
      
      <main className="container mx-auto px-4 py-6">
        {/* Breadcrumbs */}
        <div className="text-sm text-neutral-600 mb-4">
          <Link href="/">
            <a className="hover:text-primary inline-flex items-center">
              <HomeIcon className="h-3 w-3 mr-1" />
              Inicio
            </a>
          </Link> / 
          <Link href="/catalog">
            <a className="hover:text-primary ml-1">Catálogo</a>
          </Link>
          {!isLoading && product && (
            <>
              <span className="mx-1">/</span>
              <Link href={`/catalog?category=${encodeURIComponent(product.category)}`}>
                <a className="hover:text-primary">{product.category}</a>
              </Link>
              <span className="mx-1">/</span>
              <span className="text-neutral-800">{product.title}</span>
            </>
          )}
        </div>
        
        {/* Product Detail */}
        {isLoading ? (
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/2">
              <Skeleton className="h-80 w-full rounded-lg mb-3" />
              <div className="grid grid-cols-4 gap-2">
                <Skeleton className="h-20 w-full rounded-lg" />
                <Skeleton className="h-20 w-full rounded-lg" />
                <Skeleton className="h-20 w-full rounded-lg" />
                <Skeleton className="h-20 w-full rounded-lg" />
              </div>
            </div>
            <div className="md:w-1/2">
              <Skeleton className="h-6 w-1/4 mb-1" />
              <Skeleton className="h-10 w-3/4 mb-3" />
              <Skeleton className="h-6 w-1/4 mb-4" />
              <Skeleton className="h-8 w-1/3 mb-4" />
              <Skeleton className="h-20 w-full mb-4" />
              <Skeleton className="h-40 w-full mb-4" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        ) : product ? (
          <ProductDetail product={product} />
        ) : null}
        
        {/* Related Products */}
        {!isLoading && relatedProducts && relatedProducts.length > 0 && (
          <div className="mt-12 border-t border-neutral-200 pt-8">
            <h2 className="text-2xl font-bold mb-6">Productos relacionados</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct: any) => (
                <div key={relatedProduct.id} className="bg-white rounded-lg shadow-sm border border-neutral-200 p-4">
                  <img 
                    src={relatedProduct.images[0] || 'https://via.placeholder.com/200x150?text=Sin+Imagen'} 
                    alt={relatedProduct.title} 
                    className="w-full h-32 object-contain mb-3"
                  />
                  <h3 className="font-medium mb-1 line-clamp-1">{relatedProduct.title}</h3>
                  <div className="text-sm text-neutral-600 mb-2">{relatedProduct.brand}</div>
                  <div className="flex items-center justify-between">
                    <div className="font-semibold">${relatedProduct.price.toFixed(2)}</div>
                    <Link href={`/product/${relatedProduct.id}`}>
                      <a className="text-xs text-primary hover:text-primary/90">Ver detalles</a>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
      
      {/* Botón flotante para ir a la comparación */}
      <CompareFloatingButton />
    </div>
  );
}
