import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ICatalogFilters, ICategory, IBrand } from '@/lib/types';
import { ChevronRightIcon } from 'lucide-react';

interface ProductFiltersProps {
  categories: ICategory[];
  brands: IBrand[];
  filters: ICatalogFilters;
  onFilterChange: (filters: ICatalogFilters) => void;
}

export default function ProductFilters({ 
  categories, 
  brands, 
  filters, 
  onFilterChange 
}: ProductFiltersProps) {
  const [showMoreCategories, setShowMoreCategories] = useState(false);
  const [showMoreBrands, setShowMoreBrands] = useState(false);
  const [priceMin, setPriceMin] = useState(filters.priceRange?.min?.toString() || '');
  const [priceMax, setPriceMax] = useState(filters.priceRange?.max?.toString() || '');
  
  // Display limited items unless "show more" is clicked
  const displayedCategories = showMoreCategories ? categories : categories.slice(0, 5);
  const displayedBrands = showMoreBrands ? brands : brands.slice(0, 5);
  
  const handleCategoryChange = (categoryName: string, checked: boolean) => {
    const currentCategories = filters.categories || [];
    const newCategories = checked 
      ? [...currentCategories, categoryName]
      : currentCategories.filter(c => c !== categoryName);
    
    onFilterChange({
      ...filters,
      categories: newCategories
    });
  };
  
  const handleBrandChange = (brandName: string, checked: boolean) => {
    const currentBrands = filters.brands || [];
    const newBrands = checked 
      ? [...currentBrands, brandName]
      : currentBrands.filter(b => b !== brandName);
    
    onFilterChange({
      ...filters,
      brands: newBrands
    });
  };
  
  const handlePriceApply = () => {
    const min = priceMin ? parseFloat(priceMin) : undefined;
    const max = priceMax ? parseFloat(priceMax) : undefined;
    
    onFilterChange({
      ...filters,
      priceRange: { min, max }
    });
  };
  
  const handleAvailabilityChange = (availability: 'instock' | 'backorder', checked: boolean) => {
    if (checked) {
      onFilterChange({
        ...filters,
        availability
      });
    } else if (filters.availability === availability) {
      onFilterChange({
        ...filters,
        availability: 'all'
      });
    }
  };
  
  return (
    <Card className="border border-neutral-200 sticky top-[172px]">
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-4">Filtros</h3>
        
        {/* Categories */}
        <div className="mb-6">
          <h4 className="font-medium text-neutral-800 mb-2">Categorías</h4>
          <div className="space-y-2">
            {displayedCategories.map(category => (
              <div key={category.id} className="flex items-center">
                <Checkbox 
                  id={`category-${category.id}`}
                  checked={filters.categories?.includes(category.name)}
                  onCheckedChange={(checked) => 
                    handleCategoryChange(category.name, checked as boolean)
                  }
                  className="text-primary"
                />
                <Label 
                  htmlFor={`category-${category.id}`}
                  className="ml-2 text-sm cursor-pointer"
                >
                  {category.name} ({category.count})
                </Label>
              </div>
            ))}
          </div>
          
          {categories.length > 5 && (
            <Button 
              variant="link" 
              className="text-accent hover:text-accent/90 text-sm mt-2 p-0 h-auto"
              onClick={() => setShowMoreCategories(!showMoreCategories)}
            >
              {showMoreCategories ? 'Ver menos categorías' : 'Ver más categorías'}
              <ChevronRightIcon className={`h-4 w-4 ml-1 transition-transform ${showMoreCategories ? 'rotate-90' : ''}`} />
            </Button>
          )}
        </div>
        
        {/* Brands */}
        <div className="mb-6">
          <h4 className="font-medium text-neutral-800 mb-2">Marcas</h4>
          <div className="space-y-2">
            {displayedBrands.map(brand => (
              <div key={brand.id} className="flex items-center">
                <Checkbox 
                  id={`brand-${brand.id}`}
                  checked={filters.brands?.includes(brand.name)}
                  onCheckedChange={(checked) => 
                    handleBrandChange(brand.name, checked as boolean)
                  }
                  className="text-primary"
                />
                <Label 
                  htmlFor={`brand-${brand.id}`}
                  className="ml-2 text-sm cursor-pointer"
                >
                  {brand.name} ({brand.count})
                </Label>
              </div>
            ))}
          </div>
          
          {brands.length > 5 && (
            <Button 
              variant="link" 
              className="text-accent hover:text-accent/90 text-sm mt-2 p-0 h-auto"
              onClick={() => setShowMoreBrands(!showMoreBrands)}
            >
              {showMoreBrands ? 'Ver menos marcas' : 'Ver más marcas'}
              <ChevronRightIcon className={`h-4 w-4 ml-1 transition-transform ${showMoreBrands ? 'rotate-90' : ''}`} />
            </Button>
          )}
        </div>
        
        {/* Price Range */}
        <div className="mb-6">
          <h4 className="font-medium text-neutral-800 mb-2">Rango de precio</h4>
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="price-min" className="sr-only">Mínimo</Label>
                <Input
                  id="price-min"
                  type="number"
                  placeholder="Min"
                  value={priceMin}
                  onChange={e => setPriceMin(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="price-max" className="sr-only">Máximo</Label>
                <Input
                  id="price-max"
                  type="number"
                  placeholder="Max"
                  value={priceMax}
                  onChange={e => setPriceMax(e.target.value)}
                />
              </div>
            </div>
            <Button 
              variant="secondary" 
              className="w-full mt-2"
              onClick={handlePriceApply}
            >
              Aplicar
            </Button>
          </div>
        </div>
        
        {/* Availability */}
        <div>
          <h4 className="font-medium text-neutral-800 mb-2">Disponibilidad</h4>
          <div className="space-y-2">
            <div className="flex items-center">
              <Checkbox 
                id="availability-instock"
                checked={filters.availability === 'instock'}
                onCheckedChange={(checked) => 
                  handleAvailabilityChange('instock', checked as boolean)
                }
                className="text-primary"
              />
              <Label 
                htmlFor="availability-instock"
                className="ml-2 text-sm cursor-pointer"
              >
                En stock (98)
              </Label>
            </div>
            <div className="flex items-center">
              <Checkbox 
                id="availability-backorder"
                checked={filters.availability === 'backorder'}
                onCheckedChange={(checked) => 
                  handleAvailabilityChange('backorder', checked as boolean)
                }
                className="text-primary"
              />
              <Label 
                htmlFor="availability-backorder"
                className="ml-2 text-sm cursor-pointer"
              >
                Bajo pedido (45)
              </Label>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
