import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation, Link } from 'wouter';
import VehicleSelector from '@/components/vehicle/VehicleSelector';
import ActiveVehicle from '@/components/vehicle/ActiveVehicle';
import ProductGrid from '@/components/catalog/ProductGrid';
import ProductFilters from '@/components/catalog/ProductFilters';
import { ICatalogFilters, IProduct } from '@/lib/types';
import { useVehicle } from '@/hooks/use-vehicle';
import ImportData from '@/components/admin/ImportData';
import { CompareFloatingButton } from '@/components/product/CompareFloatingButton';
import { Button } from '@/components/ui/button';
import { HomeIcon, UploadIcon } from 'lucide-react';

export default function Catalog() {
  const [location] = useLocation();
  const { selectedVehicle } = useVehicle();
  
  // Parse URL params
  const params = new URLSearchParams(location.split('?')[1] || '');
  
  // State
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('relevance');
  const [filters, setFilters] = useState<ICatalogFilters>({
    categories: params.getAll('category').length > 0 ? params.getAll('category') : undefined,
    brands: params.getAll('brand').length > 0 ? params.getAll('brand') : undefined,
  });
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  
  // Generate query string based on current filters and vehicle
  const getQueryString = () => {
    const queryParams = new URLSearchParams();
    
    // Vehicle filters
    if (selectedVehicle) {
      queryParams.append('year', selectedVehicle.year.toString());
      queryParams.append('make', selectedVehicle.make);
      queryParams.append('model', selectedVehicle.model);
      if (selectedVehicle.engine) {
        queryParams.append('engine', selectedVehicle.engine);
      }
    }
    
    // Category filters
    if (filters.categories?.length) {
      filters.categories.forEach(cat => queryParams.append('category', cat));
    }
    
    // Brand filters
    if (filters.brands?.length) {
      filters.brands.forEach(brand => queryParams.append('brand', brand));
    }
    
    // Price range
    if (filters.priceRange?.min !== undefined) {
      queryParams.append('min_price', filters.priceRange.min.toString());
    }
    if (filters.priceRange?.max !== undefined) {
      queryParams.append('max_price', filters.priceRange.max.toString());
    }
    
    // Availability
    if (filters.availability && filters.availability !== 'all') {
      queryParams.append('availability', filters.availability);
    }
    
    // Sorting
    if (sortBy !== 'relevance') {
      queryParams.append('sort', sortBy);
    }
    
    // Pagination
    if (currentPage > 1) {
      queryParams.append('page', currentPage.toString());
    }
    
    return queryParams.toString();
  };
  
  // Fetch products based on filters
  const { data: productsData, isLoading } = useQuery({
    queryKey: ['/api/products', getQueryString()],
  });
  
  // Fetch categories for filtering
  const { data: categories = [] } = useQuery({
    queryKey: ['/api/categories'],
  });
  
  // Fetch brands for filtering
  const { data: brands = [] } = useQuery({
    queryKey: ['/api/brands'],
  });
  
  // Handle filter changes
  const handleFilterChange = (newFilters: ICatalogFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };
  
  // Handle sort changes
  const handleSortChange = (value: string) => {
    setSortBy(value);
    setCurrentPage(1); // Reset to first page when sort changes
  };
  
  // Show admin import data modal with Alt+I
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === 'i') {
        setIsImportModalOpen(true);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
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
          <span className="text-neutral-800 ml-1">Catálogo</span>
          {selectedVehicle && (
            <>
              <span className="mx-1">/</span>
              <span className="text-neutral-800">
                {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}
              </span>
            </>
          )}
        </div>

        {/* Active Vehicle Filter */}
        {selectedVehicle && (
          <ActiveVehicle productCount={productsData?.total || 0} />
        )}

        {/* Product Grid with Filters */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Filters */}
          <div className="lg:w-1/4">
            <ProductFilters 
              categories={categories} 
              brands={brands}
              filters={filters}
              onFilterChange={handleFilterChange}
            />
            
            {/* Admin Tools */}
            <Button 
              variant="outline" 
              className="mt-4 w-full"
              onClick={() => setIsImportModalOpen(true)}
            >
              <UploadIcon className="mr-2 h-4 w-4" />
              Importar datos
            </Button>
          </div>
          
          {/* Products Grid */}
          <div className="lg:w-3/4">
            {isLoading ? (
              // Loading skeleton
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array(9).fill(0).map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow-sm h-96 animate-pulse">
                    <div className="w-full h-48 bg-neutral-200 rounded-t-lg"></div>
                    <div className="p-4">
                      <div className="h-4 bg-neutral-200 rounded w-1/4 mb-2"></div>
                      <div className="h-6 bg-neutral-200 rounded w-3/4 mb-3"></div>
                      <div className="h-4 bg-neutral-200 rounded w-1/2 mb-3"></div>
                      <div className="h-4 bg-neutral-200 rounded w-full mb-3"></div>
                      <div className="h-4 bg-neutral-200 rounded w-3/4 mb-4"></div>
                      <div className="flex justify-between">
                        <div className="h-6 bg-neutral-200 rounded w-1/4"></div>
                        <div className="h-8 bg-neutral-200 rounded w-1/4"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <ProductGrid 
                products={productsData?.products || []}
                totalCount={productsData?.total || 0}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                onSortChange={handleSortChange}
              />
            )}
          </div>
        </div>
      </main>
      
      {/* Import Data Modal */}
      <ImportData open={isImportModalOpen} onOpenChange={setIsImportModalOpen} />
      
      {/* Botón flotante para ir a la comparación */}
      <CompareFloatingButton />
    </div>
  );
}
