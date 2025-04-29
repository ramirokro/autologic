import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { VideoDetails } from '@/types/video';
import { formatDuration, formatDate } from '@/utils/format';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Play, 
  Clock, 
  Calendar, 
  Tag, 
  Wrench, 
  ChevronLeft,
  Info,
} from 'lucide-react';

interface VideoDetailProps {
  videoId: number;
}

export function VideoDetail({ videoId }: VideoDetailProps) {
  const { data: video, isLoading, isError } = useQuery<VideoDetails>({
    queryKey: ['/api/videos', videoId],
    queryFn: async () => {
      const response = await fetch(`/api/videos/${videoId}`);
      if (!response.ok) throw new Error('Error al cargar el video');
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="aspect-video w-full bg-muted rounded-lg overflow-hidden">
          <Skeleton className="h-full w-full" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    );
  }

  if (isError || !video) {
    return (
      <div className="rounded-lg bg-destructive/20 p-6 text-destructive">
        <h3 className="text-lg font-medium mb-2">Error al cargar el video</h3>
        <p className="mb-4">No se pudo cargar la información del tutorial.</p>
        <Link href="/videos">
          <Button variant="outline" className="flex items-center gap-1">
            <ChevronLeft className="h-4 w-4" />
            Volver a tutoriales
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <Link href="/videos">
            <Button variant="ghost" size="sm" className="flex items-center gap-1 -ml-2">
              <ChevronLeft className="h-4 w-4" />
              <span>Volver a tutoriales</span>
            </Button>
          </Link>
          <Badge className="capitalize">{video.category}</Badge>
        </div>
        
        <h1 className="text-2xl sm:text-3xl font-bold">{video.title}</h1>
        
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground mb-2">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{formatDuration(video.duration)}</span>
          </div>
          
          {video.createdAt && (
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(video.createdAt)}</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="aspect-video w-full bg-black rounded-lg overflow-hidden">
        <iframe
          src={video.videoUrl}
          title={video.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        ></iframe>
      </div>
      
      <Tabs defaultValue="description" className="w-full">
        <TabsList className="w-full grid grid-cols-2 sm:grid-cols-4 mb-4">
          <TabsTrigger value="description">Descripción</TabsTrigger>
          <TabsTrigger value="details">Detalles</TabsTrigger>
          <TabsTrigger value="compatibility">Compatibilidad</TabsTrigger>
          <TabsTrigger value="related">Relacionados</TabsTrigger>
        </TabsList>
        
        <TabsContent value="description" className="space-y-4">
          <p className="text-muted-foreground leading-relaxed">
            {video.description}
          </p>
        </TabsContent>
        
        <TabsContent value="details" className="space-y-4">
          {/* Nivel de dificultad */}
          <div className="flex items-center gap-2">
            <Wrench className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Nivel de dificultad:</span>
            <Badge 
              variant={
                video.difficultyLevel === 'beginner' ? 'outline' : 
                video.difficultyLevel === 'intermediate' ? 'secondary' : 
                'destructive'
              }
            >
              {video.difficultyLevel === 'beginner' ? 'Principiante' : 
               video.difficultyLevel === 'intermediate' ? 'Intermedio' : 
               'Avanzado'}
            </Badge>
          </div>
          
          {/* Etiquetas */}
          {video.tags && video.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Etiquetas:</span>
              {video.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="capitalize">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="compatibility" className="space-y-4">
          {/* Vehículos compatibles */}
          {video.compatibleVehicles && video.compatibleVehicles.length > 0 ? (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Vehículos compatibles</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {video.compatibleVehicles.map((vehicle, index) => (
                  <div key={index} className="border border-border rounded-lg p-3">
                    <div className="font-medium">{vehicle.make} {vehicle.model}</div>
                    <div className="text-sm text-muted-foreground">
                      {vehicle.year} {vehicle.engine && `- ${vehicle.engine}`}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
              <Info className="h-10 w-10 text-muted-foreground mb-4" />
              <h4 className="text-lg font-medium mb-2">No hay información de compatibilidad</h4>
              <p className="text-muted-foreground mb-4">
                Este tutorial es de carácter general y no está asociado a modelos específicos.
              </p>
            </div>
          )}
          
          {/* Productos relacionados */}
          {video.relatedProducts && video.relatedProducts.length > 0 && (
            <div className="mt-8 space-y-4">
              <h3 className="text-lg font-semibold">Productos relacionados</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {video.relatedProducts.map((product, index) => (
                  <Link key={index} href={`/product/${product.id}`}>
                    <div className="border border-border rounded-lg p-3 hover:border-primary hover:bg-accent transition-colors cursor-pointer">
                      <div className="font-medium line-clamp-1">{product.title}</div>
                      <div className="text-sm text-muted-foreground">{product.brand}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="related" className="space-y-4">
          {/* Videos relacionados */}
          {video.relatedVideos && video.relatedVideos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {video.relatedVideos.map((relatedVideo, index) => (
                <Link key={index} href={`/videos/${relatedVideo.id}`}>
                  <Card className="overflow-hidden h-full hover:shadow-md transition-shadow cursor-pointer">
                    <div className="aspect-video w-full relative group">
                      <img 
                        src={relatedVideo.thumbnailUrl} 
                        alt={relatedVideo.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                        <Play className="w-10 h-10 text-white" />
                      </div>
                    </div>
                    <CardContent className="p-3">
                      <h4 className="font-medium line-clamp-2">{relatedVideo.title}</h4>
                      <div className="flex items-center justify-between mt-2">
                        <Badge variant="secondary" className="text-xs">
                          {relatedVideo.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDuration(relatedVideo.duration)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
              <Info className="h-10 w-10 text-muted-foreground mb-4" />
              <h4 className="text-lg font-medium mb-2">No hay videos relacionados</h4>
              <p className="text-muted-foreground mb-4">
                No se encontraron videos relacionados con este tutorial.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}