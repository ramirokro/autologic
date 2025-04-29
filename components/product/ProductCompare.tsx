import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { X, Trash2, AlertTriangle, Info, Check, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { Product } from '@shared/schema';
import { useLocation } from 'wouter';
import { COMPARE_PRODUCTS_UPDATED } from './CompareFloatingButton';

interface ProductToCompare extends Product {
  selected: boolean;
}

export function ProductCompare() {
  const [selectedProducts, setSelectedProducts] = useState<ProductToCompare[]>([]);
  const [productIds, setProductIds] = useState<number[]>([]);
  const { toast } = useToast();
  const [, navigate] = useLocation();

  // Cargar los IDs de productos desde localStorage al iniciar
  useEffect(() => {
    const savedIds = localStorage.getItem('compareProducts');
    if (savedIds) {
      try {
        const ids = JSON.parse(savedIds) as number[];
        setProductIds(ids);
      } catch (error) {
        console.error('Error al cargar productos para comparar:', error);
      }
    }
  }, []);

  // Obtener los detalles de los productos seleccionados
  const { data: products, isLoading, error } = useQuery({
    queryKey: ['/api/products/compare', productIds],
    queryFn: () => {
      if (productIds.length === 0) return Promise.resolve([]);
      return apiRequest('POST', '/api/products/compare', { productIds })
        .then(res => res.json());
    },
    enabled: productIds.length > 0,
  });

  // Cuando cambian los productos recibidos, actualizar el estado
  useEffect(() => {
    if (products) {
      const productsWithSelection = products.map((p: Product) => ({
        ...p,
        selected: true
      }));
      setSelectedProducts(productsWithSelection);
    }
  }, [products]);

  // Guardar los cambios en localStorage cuando cambia la selección
  useEffect(() => {
    const selectedIds = selectedProducts
      .filter(p => p.selected)
      .map(p => p.id);
    
    if (selectedIds.length > 0) {
      localStorage.setItem('compareProducts', JSON.stringify(selectedIds));
      setProductIds(selectedIds);
    } else {
      localStorage.removeItem('compareProducts');
      setProductIds([]);
    }
  }, [selectedProducts]);

  // Remover un producto de la comparación
  const removeProduct = (productId: number) => {
    setSelectedProducts(prev => 
      prev.map(p => p.id === productId ? { ...p, selected: false } : p)
    );
    
    toast({
      title: "Producto removido",
      description: "El producto ha sido eliminado de la comparación.",
      variant: "default",
    });
  };

  // Limpiar la comparación
  const clearComparison = () => {
    setSelectedProducts([]);
    localStorage.removeItem('compareProducts');
    setProductIds([]);
    
    toast({
      title: "Comparación limpiada",
      description: "Se han eliminado todos los productos de la comparación.",
      variant: "default",
    });
  };

  // Ver la página del producto
  const viewProduct = (productId: number) => {
    navigate(`/product/${productId}`);
  };

  // Si no hay productos para comparar
  if (productIds.length === 0 || selectedProducts.filter(p => p.selected).length === 0) {
    return (
      <Card className="mx-auto max-w-4xl">
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center">
            <Info className="h-5 w-5 mr-2 text-primary" />
            Comparador de Productos
          </CardTitle>
          <CardDescription>
            Selecciona productos en el catálogo para compararlos
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
          <h3 className="text-lg font-medium mb-2">No hay productos para comparar</h3>
          <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
            Agrega productos a la comparación navegando al catálogo y 
            haciendo clic en "Añadir a comparación" en cada producto que desees evaluar.
          </p>
          <Button 
            onClick={() => navigate('/catalog')}
            variant="default"
          >
            Ir al Catálogo
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Si está cargando los datos
  if (isLoading) {
    return (
      <Card className="mx-auto max-w-4xl">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Cargando comparación...</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-12">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </CardContent>
      </Card>
    );
  }

  // Si hay un error
  if (error) {
    return (
      <Card className="mx-auto max-w-4xl">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-destructive">Error</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
          <h3 className="text-lg font-medium mb-2">No se pudieron cargar los productos</h3>
          <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
            Ocurrió un error al intentar cargar los productos para comparar. 
            Inténtalo de nuevo más tarde.
          </p>
          <Button 
            onClick={clearComparison}
            variant="outline"
            className="border-destructive text-destructive hover:bg-destructive/10"
          >
            Limpiar Comparación
            <Trash2 className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Filtrar solo productos seleccionados
  const productsToShow = selectedProducts.filter(p => p.selected);

  // Renderizar la comparación
  return (
    <Card className="mx-auto max-w-6xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl font-bold flex items-center">
            <Info className="h-5 w-5 mr-2 text-primary" />
            Comparador de Productos
          </CardTitle>
          <CardDescription>
            Comparando {productsToShow.length} productos
          </CardDescription>
        </div>
        <Button 
          onClick={clearComparison}
          variant="outline"
          size="sm"
        >
          Limpiar Comparación
          <Trash2 className="ml-2 h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table className="min-w-[600px]">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[150px]">Característica</TableHead>
              {productsToShow.map(product => (
                <TableHead key={product.id} className="min-w-[200px]">
                  <div className="flex flex-col items-center">
                    <div className="relative w-20 h-20 mb-2">
                      <img 
                        src={product.images[0] || 'https://via.placeholder.com/100?text=Sin+Imagen'} 
                        alt={product.title}
                        className="rounded-md object-contain w-full h-full"
                      />
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-white border-muted-foreground/20"
                        onClick={() => removeProduct(product.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    <h3 className="text-sm font-medium truncate w-full text-center">
                      {product.title}
                    </h3>
                    <Badge variant="outline" className="mt-1 mb-2">
                      {product.brand}
                    </Badge>
                    <Button 
                      variant="default" 
                      size="sm"
                      className="w-full"
                      onClick={() => viewProduct(product.id)}
                    >
                      Ver Detalle
                    </Button>
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Categoría</TableCell>
              {productsToShow.map(product => (
                <TableCell key={`${product.id}-category`} className="text-center">
                  {product.category}
                </TableCell>
              ))}
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Precio</TableCell>
              {productsToShow.map(product => (
                <TableCell key={`${product.id}-price`} className="text-center">
                  <span className="font-semibold text-green-600">${product.price.toFixed(2)}</span>
                </TableCell>
              ))}
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Disponibilidad</TableCell>
              {productsToShow.map(product => (
                <TableCell key={`${product.id}-stock`} className="text-center">
                  {product.inStock ? (
                    <div className="flex items-center justify-center">
                      <Check className="mr-1 h-4 w-4 text-green-500" />
                      <span>En Stock ({product.stock})</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <X className="mr-1 h-4 w-4 text-red-500" />
                      <span>Agotado</span>
                    </div>
                  )}
                </TableCell>
              ))}
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">SKU</TableCell>
              {productsToShow.map(product => (
                <TableCell key={`${product.id}-sku`} className="text-center">
                  {product.sku}
                </TableCell>
              ))}
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Descripción</TableCell>
              {productsToShow.map(product => (
                <TableCell key={`${product.id}-desc`} className="text-sm">
                  {product.description.length > 100
                    ? `${product.description.substring(0, 100)}...`
                    : product.description}
                </TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// Componente pequeño para mostrar en la tarjeta de producto
export function AddToCompareButton({ product }: { product: Product }) {
  const [isInCompare, setIsInCompare] = useState(false);
  const { toast } = useToast();

  // Verificar si el producto ya está en la comparación
  useEffect(() => {
    const savedIds = localStorage.getItem('compareProducts');
    if (savedIds) {
      try {
        const ids = JSON.parse(savedIds) as number[];
        setIsInCompare(ids.includes(product.id));
      } catch (error) {
        console.error('Error al verificar productos para comparar:', error);
      }
    }
  }, [product.id]);

  const toggleCompare = () => {
    const savedIds = localStorage.getItem('compareProducts');
    let ids: number[] = [];
    
    if (savedIds) {
      try {
        ids = JSON.parse(savedIds) as number[];
      } catch (error) {
        console.error('Error al procesar productos para comparar:', error);
      }
    }

    if (isInCompare) {
      // Quitar de la comparación
      ids = ids.filter(id => id !== product.id);
      toast({
        title: "Producto removido",
        description: "Producto eliminado de la comparación.",
        variant: "default",
      });
    } else {
      // Añadir a la comparación (máximo 4)
      if (ids.length >= 4) {
        toast({
          title: "Límite alcanzado",
          description: "Solo puedes comparar hasta 4 productos simultáneamente.",
          variant: "destructive",
        });
        return;
      }
      
      ids.push(product.id);
      toast({
        title: "Producto añadido",
        description: "Producto añadido a la comparación.",
        variant: "default",
      });
    }

    // Guardar en localStorage
    if (ids.length > 0) {
      localStorage.setItem('compareProducts', JSON.stringify(ids));
    } else {
      localStorage.removeItem('compareProducts');
    }
    
    // Actualizar estado local y notificar al botón flotante
    setIsInCompare(!isInCompare);
    
    // Disparar evento para actualizar otros componentes
    window.dispatchEvent(new Event(COMPARE_PRODUCTS_UPDATED));
  };

  return (
    <div className="flex items-center">
      <Checkbox 
        id={`compare-${product.id}`}
        checked={isInCompare}
        onCheckedChange={toggleCompare}
      />
      <label 
        htmlFor={`compare-${product.id}`}
        className="ml-2 text-sm font-medium cursor-pointer"
      >
        {isInCompare ? 'Quitar de comparación' : 'Añadir a comparación'}
      </label>
    </div>
  );
}