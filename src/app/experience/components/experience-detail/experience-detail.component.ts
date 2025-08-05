import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';

import { ExperienceService } from '../../services/experience.service';
import { Experience } from '../../models/experience.interface';

@Component({
  selector: 'app-experience-detail',
  templateUrl: './experience-detail.component.html',
  styleUrls: ['./experience-detail.component.scss']
})
export class ExperienceDetailComponent implements OnInit, OnDestroy {
  experience: Experience | null = null;
  selectedImageIndex = 0;
  
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private experienceService: ExperienceService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadExperience();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load experience details from route parameter
   */
  private loadExperience(): void {
    const experienceId = this.route.snapshot.paramMap.get('id');
    
    if (!experienceId) {
      this.showError('Invalid experience ID');
      this.router.navigate(['/experiences']);
      return;
    }

    this.experienceService.getExperienceById(experienceId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (experience) => {
          this.experience = experience;
        },
        error: (error) => {
          this.showError('Failed to load experience details');
          console.error('Error loading experience:', error);
          this.router.navigate(['/experiences']);
        }
      });
  }

  /**
   * Navigate back to experiences list
   */
  goBack(): void {
    this.router.navigate(['/experiences']);
  }

  /**
   * Navigate to edit experience
   */
  editExperience(): void {
    if (this.experience?.id) {
      this.router.navigate(['/experiences', this.experience.id, 'edit']);
    }
  }

  /**
   * Delete experience with confirmation
   */
  deleteExperience(): void {
    if (!this.experience?.id) return;

    if (confirm(`Are you sure you want to delete "${this.experience.title}"?`)) {
      this.experienceService.deleteExperience(this.experience.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.showSuccess('Experience deleted successfully');
            this.router.navigate(['/experiences']);
          },
          error: (error) => {
            this.showError('Failed to delete experience');
            console.error('Error deleting experience:', error);
          }
        });
    }
  }

  /**
   * Select image for gallery
   */
  selectImage(index: number): void {
    this.selectedImageIndex = index;
  }

  /**
   * Navigate to previous image
   */
  previousImage(): void {
    if (this.experience?.images.length) {
      this.selectedImageIndex = this.selectedImageIndex > 0 
        ? this.selectedImageIndex - 1 
        : this.experience.images.length - 1;
    }
  }

  /**
   * Navigate to next image
   */
  nextImage(): void {
    if (this.experience?.images.length) {
      this.selectedImageIndex = this.selectedImageIndex < this.experience.images.length - 1 
        ? this.selectedImageIndex + 1 
        : 0;
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
   * Format duration display
   */
  formatDuration(hours: number): string {
    if (hours < 1) {
      return `${hours * 60} minutes`;
    } else if (hours === 1) {
      return '1 hour';
    } else if (hours < 24) {
      return `${hours} hours`;
    } else {
      const days = Math.floor(hours / 24);
      const remainingHours = hours % 24;
      return remainingHours > 0 
        ? `${days} day${days > 1 ? 's' : ''} ${remainingHours} hour${remainingHours > 1 ? 's' : ''}`
        : `${days} day${days > 1 ? 's' : ''}`;
    }
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