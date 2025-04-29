import React from 'react';
import { useParams } from 'wouter';
import { VideoDetail } from '@/components/video/VideoDetail';
import { VideosList } from '@/components/video/VideosList';

export default function Video() {
  const params = useParams();
  const videoId = parseInt(params.id || '0');
  
  if (!videoId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="rounded-lg bg-destructive/20 p-6 text-destructive">
          <h3 className="text-lg font-medium mb-2">Error de ID</h3>
          <p>No se especificó un ID de video válido.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        {/* Detalles del video */}
        <VideoDetail videoId={videoId} />
        
        {/* Videos recomendados */}
        <div className="mt-16">
          <VideosList 
            title="Más tutoriales que podrían interesarte" 
            subtitle="Basados en tus preferencias"
            limit={4}
            showMoreLink={true}
          />
        </div>
      </div>
    </div>
  );
}