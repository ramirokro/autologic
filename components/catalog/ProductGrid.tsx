import { useState } from 'react';
import ProductCard from './ProductCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { IProduct } from '@/lib/types';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';

interface ProductGridProps {
  products: IProduct[];
  totalCount: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onSortChange: (sort: string) => void;
  pageSize?: number;
}

export default function ProductGrid({ 
  products, 
  totalCount, 
  currentPage,
  onPageChange,
  onSortChange,
  pageSize = 12
}: ProductGridProps) {
  const totalPages = Math.ceil(totalCount / pageSize);
  
  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    // Always show first page
    pages.push(
      <Button
        key="page-1"
        variant={currentPage === 1 ? "default" : "outline"}
        size="icon"
        className={currentPage === 1 ? "bg-primary text-white" : ""}
        onClick={() => onPageChange(1)}
      >
        1
      </Button>
    );
    
    // Calculate range of pages to show
    let startPage = Math.max(2, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 3);
    
    // Adjust start if we're near the end
    if (endPage <= startPage) {
      startPage = Math.max(2, endPage - maxVisiblePages + 3);
    }
    
    // Show ellipsis if needed before middle pages
    if (startPage > 2) {
      pages.push(
        <span key="ellipsis-1" className="px-3 py-2 text-neutral-600">...</span>
      );
    }
    
    // Add middle pages
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Button
          key={`page-${i}`}
          variant={currentPage === i ? "default" : "outline"}
          size="icon"
          className={currentPage === i ? "bg-primary text-white" : ""}
          onClick={() => onPageChange(i)}
        >
          {i}
        </Button>
      );
    }
    
    // Show ellipsis if needed after middle pages
    if (endPage < totalPages - 1) {
      pages.push(
        <span key="ellipsis-2" className="px-3 py-2 text-neutral-600">...</span>
      );
    }
    
    // Always show last page if there is more than one page
    if (totalPages > 1) {
      pages.push(
        <Button
          key={`page-${totalPages}`}
          variant={currentPage === totalPages ? "default" : "outline"}
          size="icon"
          className={currentPage === totalPages ? "bg-primary text-white" : ""}
          onClick={() => onPageChange(totalPages)}
        >
          {totalPages}
        </Button>
      );
    }
    
    return (
      <div className="flex items-center space-x-1">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </Button>
        
        {pages}
        
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
        >
          <ChevronRightIcon className="h-4 w-4" />
        </Button>
      </div>
    );
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="font-medium">{totalCount} productos compatibles</div>
        <div className="flex items-center">
          <span className="text-sm text-neutral-600 mr-2">Ordenar por:</span>
          <Select defaultValue="relevance" onValueChange={onSortChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Relevancia" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Relevancia</SelectItem>
              <SelectItem value="price_asc">Precio: menor a mayor</SelectItem>
              <SelectItem value="price_desc">Precio: mayor a menor</SelectItem>
              <SelectItem value="bestsellers">Más vendidos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          {renderPagination()}
        </div>
      )}
    </div>
  );
}
