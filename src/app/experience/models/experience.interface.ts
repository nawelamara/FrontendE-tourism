export interface Experience {
  id?: string;
  title: string;
  description: string;
  shortDescription: string;
  location: Location;
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
  availability: ExperienceAvailability[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Location {
  id: string;
  name: string;
  country: string;
  city: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface ExperienceAvailability {
  date: Date;
  availableSlots: number;
  price?: number; // Optional dynamic pricing
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
  locationId?: string;
  startDate?: string;
  endDate?: string;
  participants?: number;
  category?: ExperienceCategory;
  minPrice?: number;
  maxPrice?: number;
  difficulty?: DifficultyLevel;
  page?: number;
  limit?: number;
}

export interface ExperienceSearchResponse {
  experiences: Experience[];
  total: number;
  page: number;
  totalPages: number;
  filters: {
    locations: Location[];
    categories: ExperienceCategory[];
    priceRange: { min: number; max: number };
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}