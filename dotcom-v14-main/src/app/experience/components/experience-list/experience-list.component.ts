import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PageEvent } from '@angular/material/paginator';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

import { ExperienceService } from '../../services/experience.service';
import { 
  Experience, 
  ExperienceCategory, 
  DifficultyLevel,
  ExperienceSearchParams,
  ExperienceListResponse 
} from '../../models/experience.interface';

@Component({
  selector: 'app-experience-list',
  templateUrl: './experience-list.component.html',
  styleUrls: ['./experience-list.component.scss']
})
export class ExperienceListComponent implements OnInit, OnDestroy {
  experiences: Experience[] = [];
  totalExperiences = 0;
  currentPage = 0;
  pageSize = 12;
  totalPages = 0;
  
  searchForm: FormGroup;
  categories = Object.values(ExperienceCategory);
  difficulties = Object.values(DifficultyLevel);
  
  private destroy$ = new Subject<void>();

  constructor(
    private experienceService: ExperienceService,
    private router: Router,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.searchForm = this.createSearchForm();
  }

  ngOnInit(): void {
    this.loadExperiences();
    this.setupSearchFormSubscription();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Create reactive search form
   */
  private createSearchForm(): FormGroup {
    return this.fb.group({
      search: [''],
      category: [''],
      difficulty: [''],
      location: [''],
      minPrice: [''],
      maxPrice: ['']
    });
  }

  /**
   * Setup search form subscription with debouncing
   */
  private setupSearchFormSubscription(): void {
    this.searchForm.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.currentPage = 0;
        this.loadExperiences();
      });
  }

  /**
   * Load experiences with current search parameters
   */
  loadExperiences(): void {
    const searchParams: ExperienceSearchParams = {
      ...this.searchForm.value,
      page: this.currentPage + 1,
      limit: this.pageSize
    };

    // Remove empty values
    Object.keys(searchParams).forEach(key => {
      const value = (searchParams as any)[key];
      if (value === '' || value === null || value === undefined) {
        delete (searchParams as any)[key];
      }
    });

    this.experienceService.getExperiences(searchParams)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: ExperienceListResponse) => {
          this.experiences = response.experiences;
          this.totalExperiences = response.total;
          this.totalPages = response.totalPages;
        },
        error: (error) => {
          this.showError('Failed to load experiences. Please try again.');
          console.error('Error loading experiences:', error);
        }
      });
  }

  /**
   * Handle pagination change
   */
  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadExperiences();
  }

  /**
   * Clear all search filters
   */
  clearFilters(): void {
    this.searchForm.reset();
    this.currentPage = 0;
  }

  /**
   * Navigate to experience detail
   */
  viewExperience(experienceId: string): void {
    this.router.navigate(['/experiences', experienceId]);
  }

  /**
   * Navigate to create new experience
   */
  createExperience(): void {
    this.router.navigate(['/experiences/new']);
  }

  /**
   * Navigate to edit experience
   */
  editExperience(experienceId: string, event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/experiences', experienceId, 'edit']);
  }

  /**
   * Delete experience with confirmation
   */
  deleteExperience(experience: Experience, event: Event): void {
    event.stopPropagation();
    
    if (confirm(`Are you sure you want to delete "${experience.title}"?`)) {
      this.experienceService.deleteExperience(experience.id!)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.showSuccess('Experience deleted successfully');
            this.loadExperiences();
          },
          error: (error) => {
            this.showError('Failed to delete experience. Please try again.');
            console.error('Error deleting experience:', error);
          }
        });
    }
  }

  /**
   * Get star rating array for display
   */
  getStarRating(rating: number): boolean[] {
    return Array(5).fill(false).map((_, i) => i < Math.floor(rating));
  }

  /**
   * Format price with currency
   */
  formatPrice(price: number, currency: string): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD'
    }).format(price);
  }

  /**
   * Get loading state from service
   */
  get isLoading(): boolean {
    return this.experienceService.loading$.value;
  }

  /**
   * Show success message
   */
  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  /**
   * Show error message
   */
  private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }
}