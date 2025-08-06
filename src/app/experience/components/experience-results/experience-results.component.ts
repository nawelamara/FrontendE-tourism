import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PageEvent } from '@angular/material/paginator';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

import { ExperienceService } from '../../services/experience.service';
import { 
  Experience, 
  ExperienceCategory, 
  DifficultyLevel,
  ExperienceSearchParams,
  ExperienceSearchResponse,
  Location
} from '../../models/experience.interface';

@Component({
  selector: 'app-experience-results',
  templateUrl: './experience-results.component.html',
  styleUrls: ['./experience-results.component.scss']
})
export class ExperienceResultsComponent implements OnInit, OnDestroy {
  experiences: Experience[] = [];
  totalExperiences = 0;
  currentPage = 0;
  pageSize = 12;
  totalPages = 0;
  
  searchParams: ExperienceSearchParams = {};
  filterForm: FormGroup;
  
  categories = Object.values(ExperienceCategory);
  difficulties = Object.values(DifficultyLevel);
  priceRange = { min: 0, max: 1000 };
  
  // UI State
  showFilters = false;
  viewMode: 'grid' | 'list' = 'grid';
  
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private experienceService: ExperienceService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.filterForm = this.createFilterForm();
  }

  ngOnInit(): void {
    this.loadSearchParams();
    this.setupFilterFormSubscription();
    this.searchExperiences();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load search parameters from route query params
   */
  private loadSearchParams(): void {
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.searchParams = {
        locationId: params['locationId'],
        startDate: params['startDate'],
        endDate: params['endDate'],
        participants: params['participants'] ? parseInt(params['participants']) : undefined,
        page: params['page'] ? parseInt(params['page']) : 1,
        limit: this.pageSize
      };
    });
  }

  /**
   * Create filter form
   */
  private createFilterForm(): FormGroup {
    return this.fb.group({
      category: [''],
      difficulty: [''],
      minPrice: [0],
      maxPrice: [1000],
      sortBy: ['rating'] // rating, price_asc, price_desc, duration
    });
  }

  /**
   * Setup filter form subscription
   */
  private setupFilterFormSubscription(): void {
    this.filterForm.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.currentPage = 0;
        this.searchExperiences();
      });
  }

  /**
   * Search experiences with current parameters
   */
  private searchExperiences(): void {
    const filterValues = this.filterForm.value;
    
    const searchParams: ExperienceSearchParams = {
      ...this.searchParams,
      ...filterValues,
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

    this.experienceService.searchExperiences(searchParams)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: ExperienceSearchResponse) => {
          this.experiences = response.experiences;
          this.totalExperiences = response.total;
          this.totalPages = response.totalPages;
          
          // Update price range from filters
          if (response.filters?.priceRange) {
            this.priceRange = response.filters.priceRange;
          }
        },
        error: (error) => {
          this.showError('Erreur lors de la recherche d\'expériences');
          console.error('Error searching experiences:', error);
        }
      });
  }

  /**
   * Handle pagination change
   */
  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.searchExperiences();
  }

  /**
   * Toggle filters panel
   */
  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  /**
   * Clear all filters
   */
  clearFilters(): void {
    this.filterForm.reset({
      category: '',
      difficulty: '',
      minPrice: 0,
      maxPrice: 1000,
      sortBy: 'rating'
    });
  }

  /**
   * Change view mode
   */
  setViewMode(mode: 'grid' | 'list'): void {
    this.viewMode = mode;
  }

  /**
   * Navigate to experience detail
   */
  viewExperience(experienceId: string): void {
    this.router.navigate(['/experiences', experienceId], {
      queryParams: {
        returnUrl: this.router.url
      }
    });
  }

  /**
   * Book experience
   */
  bookExperience(experience: Experience, event: Event): void {
    event.stopPropagation();
    
    // Navigate to booking page with experience and search parameters
    this.router.navigate(['/experiences', experience.id, 'book'], {
      queryParams: {
        startDate: this.searchParams.startDate,
        endDate: this.searchParams.endDate,
        participants: this.searchParams.participants
      }
    });
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
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency || 'EUR'
    }).format(price);
  }

  /**
   * Format duration display
   */
  formatDuration(hours: number): string {
    if (hours < 1) {
      return `${hours * 60} min`;
    } else if (hours === 1) {
      return '1h';
    } else if (hours < 24) {
      return `${hours}h`;
    } else {
      const days = Math.floor(hours / 24);
      const remainingHours = hours % 24;
      return remainingHours > 0 
        ? `${days}j ${remainingHours}h`
        : `${days}j`;
    }
  }

  /**
   * Get search summary text
   */
  getSearchSummary(): string {
    const { startDate, endDate, participants } = this.searchParams;
    let summary = '';
    
    if (startDate && endDate) {
      const start = new Date(startDate).toLocaleDateString('fr-FR');
      const end = new Date(endDate).toLocaleDateString('fr-FR');
      summary += `${start} - ${end}`;
    }
    
    if (participants) {
      summary += ` • ${participants} participant${participants > 1 ? 's' : ''}`;
    }
    
    return summary;
  }

  /**
   * Get loading state from service
   */
  get isLoading(): boolean {
    return this.experienceService.loading$.value;
  }

  /**
   * Show error message
   */
  private showError(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }
}