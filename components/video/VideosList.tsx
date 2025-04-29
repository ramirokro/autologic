import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { formatDuration } from '@/utils/format';
import { VideoTutorial } from '@/types/video';
import { Clock, Play, ChevronRight } from 'lucide-react';

interface VideosListProps {
  title?: string;
  subtitle?: string;
  limit?: number;
  category?: string;
  vehicleId?: number;
  productId?: number;
  showMoreLink?: boolean;
  compact?: boolean;
}

export function VideosList({
  title = 'Videos',
  subtitle,
  limit = 4,
  category,
  vehicleId,
  productId,
  showMoreLink = true,
  compact = false
}: VideosListProps) {
  // Construir query parameters
  const buildQueryParams = () => {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    if (category) params.append('category', category);
    if (vehicleId) params.append('vehicleId', vehicleId.toString());
    if (productId) params.append('productId', productId.toString());
    
    return params.toString();
  };

  const { data: videosData, isLoading, isError } = useQuery<{ videos: VideoTutorial[]; total: number }>({
    queryKey: ['/api/videos', { limit, category, vehicleId, productId }],
    queryFn: async () => {
      const response = await fetch(`/api/videos?${buildQueryParams()}`);
      if (!response.ok) throw new Error('Error al cargar los videos');
      return response.json();
    },
  });

  const videos = videosData?.videos || [];
  const total = videosData?.total || 0;

  // Función para formatear el nivel de dificultad
  const getDifficultyBadge = (level: string) => {
    let variant = 'secondary';
    let text = level;
    
    switch (level.toLowerCase()) {
      case 'beginner':
        variant = 'outline';
        text = 'Principiante';
        break;
      case 'intermediate':
        variant = 'secondary';
        text = 'Intermedio';
        break;
      case 'advanced':
        variant = 'destructive';
        text = 'Avanzado';
        break;
    }
    
    return (
      <Badge variant={variant as any} className="text-xs">
        {text}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {title && <h2 className="text-2xl font-bold">{title}</h2>}
        {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: limit }).map((_, index) => (
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
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-4">
        {title && <h2 className="text-2xl font-bold">{title}</h2>}
        
        <div className="rounded-lg bg-destructive/20 p-4 text-destructive">
          <p className="font-medium">Error al cargar los videos</p>
          <p className="text-sm">Por favor, intenta nuevamente más tarde.</p>
        </div>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="space-y-4">
        {title && <h2 className="text-2xl font-bold">{title}</h2>}
        
        <div className="rounded-lg bg-muted p-6 text-center text-muted-foreground">
          No hay videos disponibles.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          {title && <h2 className="text-2xl font-bold">{title}</h2>}
          {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
        </div>
        
        {showMoreLink && videos.length > 0 && (
          <Link href="/videos">
            <Button variant="link" className="flex items-center gap-1 -mr-2">
              <span>Ver más</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        )}
      </div>
      
      <div className={`grid grid-cols-1 ${compact ? 'sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'} gap-4`}>
        {videos.map((video, index) => (
          <Link key={index} href={`/videos/${video.id}`}>
            <Card className="overflow-hidden h-full cursor-pointer hover:shadow-md transition-shadow">
              <div className="aspect-video w-full overflow-hidden relative group">
                <img 
                  src={video.thumbnailUrl} 
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                  <Play className="w-10 h-10 text-white" />
                </div>
              </div>
              <CardHeader className="pb-2">
                <CardTitle className={`${compact ? 'text-sm' : 'text-base'} leading-tight line-clamp-2`}>
                  {video.title}
                </CardTitle>
              </CardHeader>
              <CardFooter>
                <div className="flex items-center justify-between w-full">
                  {getDifficultyBadge(video.difficultyLevel)}
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
    </div>
  );
}