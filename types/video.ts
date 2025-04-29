export interface VideoTutorial {
  id: number;
  title: string;
  description: string;
  duration: number;
  videoUrl: string;
  thumbnailUrl: string;
  category: string;
  difficultyLevel: string;
  tags: string[];
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

export interface VideoDetails extends VideoTutorial {
  relatedVideos?: RelatedVideo[];
  relatedProducts?: RelatedProduct[];
  compatibleVehicles?: CompatibleVehicle[];
}

export interface RelatedVideo {
  id: number;
  title: string;
  thumbnailUrl: string;
  duration: number;
  category: string;
}

export interface RelatedProduct {
  id: number;
  title: string;
  brand: string;
}

export interface CompatibleVehicle {
  id: number;
  make: string;
  model: string;
  year: number;
  engine: string | null;
}