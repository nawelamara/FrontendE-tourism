export interface Experience {
  id?: string;
  title: string;
  description: string;
  shortDescription: string;
  location: string;
  duration: number; // in hours
  price: number;
  currency: string;
  maxParticipants: number;
  category: ExperienceCategory;
  difficulty: DifficultyLevel;
  images: string[];
  highlights: string[];
  included: string[];
  excluded: string[];
  meetingPoint: string;
  cancellationPolicy: string;
  languages: string[];
  rating: number;
  reviewCount: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export enum ExperienceCategory {
  ADVENTURE = 'adventure',
  CULTURAL = 'cultural',
  FOOD_DRINK = 'food-drink',
  NATURE = 'nature',
  HISTORICAL = 'historical',
  ENTERTAINMENT = 'entertainment',
  SPORTS = 'sports',
  WELLNESS = 'wellness'
}

export enum DifficultyLevel {
  EASY = 'easy',
  MODERATE = 'moderate',
  CHALLENGING = 'challenging',
  EXTREME = 'extreme'
}

export interface ExperienceSearchParams {
  search?: string;
  category?: ExperienceCategory;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  difficulty?: DifficultyLevel;
  page?: number;
  limit?: number;
}

export interface ExperienceListResponse {
  experiences: Experience[];
  total: number;
  page: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}