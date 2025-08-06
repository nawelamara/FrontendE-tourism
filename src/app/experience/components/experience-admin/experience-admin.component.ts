import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

import { ExperienceService } from '../../services/experience.service';
import { 
  Experience, 
  ExperienceCategory, 
  DifficultyLevel,
  ExperienceSearchParams,
  ExperienceSearchResponse 
} from '../../models/experience.interface';

@Component({
  selector: 'app-experience-admin',
  templateUrl: './experience-admin.component.html',
  styleUrls: ['./experience-admin.component.scss']
})
export class ExperienceAdminComponent implements OnInit, OnDestroy {
  experiences: Experience[] = [];
  totalExperiences = 0;
  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  
  searchForm: FormGroup;
  categories = Object.values(ExperienceCategory);
  difficulties = Object.values(DifficultyLevel);
  
  // Table columns
  displayedColumns: string[] = [
    'image', 
    'title', 
    'location', 
    'category', 
    'price', 
    'duration', 
    'rating', 
    'status', 
    'actions'
  ];
  
  private destroy$ = new Subject<void>();

  constructor(
    private experienceService: ExperienceService,
    private router: Router,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
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
      status: [''], // active, inactive, all
      sortBy: ['createdAt_desc']
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
        next: (response: ExperienceSearchResponse) => {
          this.experiences = response.experiences;
          this.totalExperiences = response.total;
          this.totalPages = response.totalPages;
        },
        error: (error) => {
          this.showError('Erreur lors du chargement des expériences');
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
    this.searchForm.reset({
      search: '',
      category: '',
      difficulty: '',
      status: '',
      sortBy: 'createdAt_desc'
    });
    this.currentPage = 0;
  }

  /**
   * Navigate to create new experience
   */
  createExperience(): void {
    this.router.navigate(['/admin/experiences/new']);
  }

  /**
   * Navigate to view experience details
   */
  viewExperience(experienceId: string): void {
    this.router.navigate(['/admin/experiences', experienceId]);
  }

  /**
   * Navigate to edit experience
   */
  editExperience(experienceId: string): void {
    this.router.navigate(['/admin/experiences', experienceId, 'edit']);
  }

  /**
   * Toggle experience active status
   */
  toggleExperienceStatus(experience: Experience): void {
    const updatedStatus = !experience.isActive;
    
    this.experienceService.updateExperience(experience.id!, { isActive: updatedStatus })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          experience.isActive = updatedStatus;
          this.showSuccess(
            `Expérience ${updatedStatus ? 'activée' : 'désactivée'} avec succès`
          );
        },
        error: (error) => {
          this.showError('Erreur lors de la mise à jour du statut');
          console.error('Error updating experience status:', error);
        }
      });
  }

  /**
   * Delete experience with confirmation
   */
  deleteExperience(experience: Experience): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Supprimer l\'expérience',
        message: `Êtes-vous sûr de vouloir supprimer "${experience.title}" ? Cette action est irréversible.`,
        confirmText: 'Supprimer',
        cancelText: 'Annuler'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.experienceService.deleteExperience(experience.id!)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.showSuccess('Expérience supprimée avec succès');
              this.loadExperiences();
            },
            error: (error) => {
              this.showError('Erreur lors de la suppression');
              console.error('Error deleting experience:', error);
            }
          });
      }
    });
  }

  /**
   * Duplicate experience
   */
  duplicateExperience(experience: Experience): void {
    const duplicatedExperience = {
      ...experience,
      title: `${experience.title} (Copie)`,
      isActive: false
    };
    
    delete duplicatedExperience.id;
    delete duplicatedExperience.createdAt;
    delete duplicatedExperience.updatedAt;

    this.experienceService.createExperience(duplicatedExperience)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (newExperience) => {
          this.showSuccess('Expérience dupliquée avec succès');
          this.loadExperiences();
          this.editExperience(newExperience.id!);
        },
        error: (error) => {
          this.showError('Erreur lors de la duplication');
          console.error('Error duplicating experience:', error);
        }
      });
  }

  /**
   * Export experiences data
   */
  exportExperiences(): void {
    // Implementation for exporting experiences to CSV/Excel
    this.showSuccess('Export en cours...');
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
      return `${days}j`;
    }
  }

  /**
   * Get status color
   */
  getStatusColor(isActive: boolean): string {
    return isActive ? 'primary' : 'warn';
  }

  /**
   * Get status text
   */
  getStatusText(isActive: boolean): string {
    return isActive ? 'Actif' : 'Inactif';
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
    this.snackBar.open(message, 'Fermer', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
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

// Confirmation Dialog Component
@Component({
  selector: 'app-confirm-dialog',
  template: `
    <h1 mat-dialog-title>{{ data.title }}</h1>
    <div mat-dialog-content>
      <p>{{ data.message }}</p>
    </div>
    <div mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">{{ data.cancelText }}</button>
      <button mat-raised-button color="warn" (click)="onConfirm()">{{ data.confirmText }}</button>
    </div>
  `
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}

import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Inject } from '@angular/core';