import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, map, finalize } from 'rxjs/operators';

import { 
  Experience, 
  Location,
  ExperienceSearchParams, 
  ExperienceSearchResponse,
  ApiResponse 
} from '../models/experience.interface';

// Configuration - Replace with your actual backend URL
export const BASE_URL = 'http://localhost:3000/api'; // Update this with your backend URL

@Injectable({
  providedIn: 'root'
})
export class ExperienceService {
  private readonly apiUrl = `${BASE_URL}/experiences`;
  private readonly locationsUrl = `${BASE_URL}/locations`;
  private loadingSubject = new BehaviorSubject<boolean>(false);
  
  // Public loading state observable
  public loading$ = this.loadingSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Get all available locations for experience search
   */
  getLocations(): Observable<Location[]> {
    this.setLoading(true);
    
    return this.http.get<ApiResponse<Location[]>>(this.locationsUrl)
      .pipe(
        map(response => response.data),
        catchError(this.handleError),
        finalize(() => this.setLoading(false))
      );
  }

  /**
   * Search experiences with filters
   */
  searchExperiences(params: ExperienceSearchParams): Observable<ExperienceSearchResponse> {
    this.setLoading(true);
    
    let httpParams = new HttpParams();
    
    if (params) {
      Object.keys(params).forEach(key => {
        const value = (params as any)[key];
        if (value !== undefined && value !== null && value !== '') {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }

    return this.http.get<ApiResponse<ExperienceSearchResponse>>(`${this.apiUrl}/search`, { params: httpParams })
      .pipe(
        map(response => response.data),
        catchError(this.handleError),
        finalize(() => this.setLoading(false))
      );
  }

  /**
   * Get all experiences with optional search parameters (for admin)
   */
  getExperiences(params?: ExperienceSearchParams): Observable<ExperienceSearchResponse> {
    this.setLoading(true);
    
    let httpParams = new HttpParams();
    
    if (params) {
      Object.keys(params).forEach(key => {
        const value = (params as any)[key];
        if (value !== undefined && value !== null && value !== '') {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }

    return this.http.get<ApiResponse<ExperienceSearchResponse>>(this.apiUrl, { params: httpParams })
      .pipe(
        map(response => response.data),
        catchError(this.handleError),
        finalize(() => this.setLoading(false))
      );
  }

  /**
   * Get a single experience by ID
   */
  getExperienceById(id: string): Observable<Experience> {
    this.setLoading(true);
    
    return this.http.get<ApiResponse<Experience>>(`${this.apiUrl}/${id}`)
      .pipe(
        map(response => response.data),
        catchError(this.handleError),
        finalize(() => this.setLoading(false))
      );
  }

  /**
   * Create a new experience
   */
  createExperience(experience: Omit<Experience, 'id' | 'createdAt' | 'updatedAt'>): Observable<Experience> {
    this.setLoading(true);
    
    return this.http.post<ApiResponse<Experience>>(this.apiUrl, experience)
      .pipe(
        map(response => response.data),
        catchError(this.handleError),
        finalize(() => this.setLoading(false))
      );
  }

  /**
   * Update an existing experience
   */
  updateExperience(id: string, experience: Partial<Experience>): Observable<Experience> {
    this.setLoading(true);
    
    return this.http.put<ApiResponse<Experience>>(`${this.apiUrl}/${id}`, experience)
      .pipe(
        map(response => response.data),
        catchError(this.handleError),
        finalize(() => this.setLoading(false))
      );
  }

  /**
   * Delete an experience
   */
  deleteExperience(id: string): Observable<void> {
    this.setLoading(true);
    
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`)
      .pipe(
        map(() => void 0),
        catchError(this.handleError),
        finalize(() => this.setLoading(false))
      );
  }

  /**
   * Check experience availability for specific dates
   */
  checkAvailability(experienceId: string, startDate: string, endDate: string, participants: number): Observable<boolean> {
    this.setLoading(true);
    
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate)
      .set('participants', participants.toString());

    return this.http.get<ApiResponse<{ available: boolean }>>(`${this.apiUrl}/${experienceId}/availability`, { params })
      .pipe(
        map(response => response.data.available),
        catchError(this.handleError),
        finalize(() => this.setLoading(false))
      );
  }

  /**
   * Set loading state
   */
  private setLoading(loading: boolean): void {
    this.loadingSubject.next(loading);
  }

  /**
   * Handle HTTP errors
   */
  private handleError = (error: HttpErrorResponse): Observable<never> => {
    let errorMessage = 'Une erreur inconnue s\'est produite';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Erreur: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = error.error?.message || `Code d'erreur: ${error.status}\nMessage: ${error.message}`;
    }
    
    console.error('ExperienceService Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  };
}