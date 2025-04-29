import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Link } from 'wouter';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pagination } from '@/components/ui/pagination';
import { formatDuration } from '@/utils/format';
import { VideoTutorial } from '@/types/video';
import { Clock, Play, Filter, Search, Wrench, Tag } from 'lucide-react';

interface VideosResponse {
  videos: VideoTutorial[];
  total: number;
}

export default function Videos() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(location.split('?')[1] || '');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterOpen, setFilterOpen] = useState<boolean>(false);
  
  // Filtros
  const [category, setCategory] = useState<string>(searchParams.get('category') || '');
  const [difficultyLevel, setDifficultyLevel] = useState<string>(searchParams.get('difficulty') || '');
  
  // Paginación
  const pageSize = 12;
  const [page, setPage] = useState<number>(parseInt(searchParams.get('page') || '1'));
  
  const { data, isLoading, isError } = useQuery<VideosResponse>({
    queryKey: ['/api/videos', { page, pageSize, category, difficultyLevel }],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', pageSize.toString());
      if (category) params.append('category', category);
      if (difficultyLevel) params.append('difficultyLevel', difficultyLevel);
      
      const response = await fetch(`/api/videos?${params.toString()}`);
      if (!response.ok) throw new Error('Error al cargar los videos');
      return response.json();
    },
  });
  
  // Consultar categorías disponibles
  const { data: categories } = useQuery<string[]>({
    queryKey: ['/api/videos/categories'],
    queryFn: async () => {
      const response = await fetch('/api/videos/categories');
      if (!response.ok) throw new Error('Error al cargar categorías');
      return response.json();
    },
  });
  
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implementar funcionalidad de búsqueda
    console.log('Búsqueda:', searchQuery);
  };
  
  const handleClearFilters = () => {
    setCategory('');
    setDifficultyLevel('');
  };
  
  const filteredVideos = data?.videos || [];
  const totalPages = data ? Math.ceil(data.total / pageSize) : 0;
  
  // Función para formatear el nivel de dificultad
  const getDifficultyColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'beginner':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100';
      case 'advanced':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  const difficultyText = (level: string) => {
    switch (level.toLowerCase()) {
      case 'beginner':
        return 'Principiante';
      case 'intermediate':
        return 'Intermedio';
      case 'advanced':
        return 'Avanzado';
      default:
        return level;
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Tutoriales en video</h1>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setFilterOpen(!filterOpen)}
          className="flex items-center gap-1"
        >
          <Filter className="w-4 h-4" />
          <span>Filtros</span>
        </Button>
      </div>
      
      {/* Panel de filtros */}
      {filterOpen && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex flex-col gap-2 flex-1">
                <label className="text-sm font-medium">Búsqueda</label>
                <form onSubmit={handleSearch} className="flex gap-2">
                  <Input 
                    placeholder="Buscar tutoriales..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit" size="sm" className="flex items-center gap-1">
                    <Search className="w-4 h-4" />
                    <span>Buscar</span>
                  </Button>
                </form>
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Categoría</label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Todas las categorías" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas las categorías</SelectItem>
                    {categories?.map((cat, index) => (
                      <SelectItem key={index} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Nivel de dificultad</label>
                <Select value={difficultyLevel} onValueChange={setDifficultyLevel}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Todos los niveles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos los niveles</SelectItem>
                    <SelectItem value="beginner">Principiante</SelectItem>
                    <SelectItem value="intermediate">Intermedio</SelectItem>
                    <SelectItem value="advanced">Avanzado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-end">
                <Button 
                  variant="ghost" 
                  onClick={handleClearFilters}
                  className="flex items-center gap-1"
                >
                  Limpiar filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: pageSize }).map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <div className="aspect-video w-full bg-muted">
                <Skeleton className="h-full w-full" />
              </div>
              <CardHeader className="pb-2">
                <Skeleton className="h-5 w-full" />
              </CardHeader>
              <CardContent className="pb-2">
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-lg bg-destructive/20 p-4 text-destructive">
          <p className="font-medium">Error al cargar los videos</p>
          <p className="text-sm">Por favor, intenta nuevamente más tarde.</p>
        </div>
      ) : filteredVideos.length === 0 ? (
        <div className="rounded-lg bg-muted p-8 text-center">
          <h3 className="text-lg font-medium mb-2">No se encontraron videos</h3>
          <p className="text-muted-foreground mb-4">
            No hay videos que coincidan con los criterios de búsqueda.
          </p>
          <Button variant="outline" onClick={handleClearFilters}>
            Limpiar filtros
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredVideos.map((video, index) => (
              <Link key={index} href={`/videos/${video.id}`}>
                <Card className="overflow-hidden h-full cursor-pointer hover:shadow-md transition-shadow">
                  <div className="aspect-video w-full overflow-hidden relative group">
                    <img 
                      src={video.thumbnailUrl} 
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                      <Play className="w-12 h-12 text-white" />
                    </div>
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base leading-tight line-clamp-2">{video.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <Badge variant="secondary" className="capitalize">
                      {video.category}
                    </Badge>
                  </CardContent>
                  <CardFooter>
                    <div className="flex items-center justify-between w-full">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${getDifficultyColor(video.difficultyLevel)}`}>
                        {difficultyText(video.difficultyLevel)}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDuration(video.duration)}
                      </span>
                    </div>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
          
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <Pagination 
                currentPage={page}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}