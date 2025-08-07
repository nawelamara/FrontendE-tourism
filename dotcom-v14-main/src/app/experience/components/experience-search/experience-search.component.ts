import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';

import { ExperienceService } from '../../services/experience.service';
import { Location, ExperienceSearchParams } from '../../models/experience.interface';

@Component({
  selector: 'app-experience-search',
  templateUrl: './experience-search.component.html',
  styleUrls: ['./experience-search.component.scss']
})
export class ExperienceSearchComponent implements OnInit, OnDestroy {
  searchForm: FormGroup;
  locations: Location[] = [];
  minDate = new Date();
  
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private experienceService: ExperienceService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.searchForm = this.createSearchForm();
  }

  ngOnInit(): void {
    this.loadLocations();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Create reactive search form
   */
  private createSearchForm(): FormGroup {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.fb.group({
      locationId: ['', Validators.required],
      startDate: [today, Validators.required],
      endDate: [tomorrow, Validators.required],
      participants: [2, [Validators.required, Validators.min(1), Validators.max(20)]]
    });
  }

  /**
   * Load available locations
   */
  private loadLocations(): void {
    this.experienceService.getLocations()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (locations) => {
          this.locations = locations;
        },
        error: (error) => {
          this.showError('Erreur lors du chargement des destinations');
          console.error('Error loading locations:', error);
        }
      });
  }

  /**
   * Handle search form submission
   */
  onSearch(): void {
    if (this.searchForm.invalid) {
      this.markFormGroupTouched();
      this.showError('Veuillez remplir tous les champs requis');
      return;
    }

    const formValue = this.searchForm.value;
    
    // Validate date range
    if (formValue.startDate >= formValue.endDate) {
      this.showError('La date de fin doit être postérieure à la date de début');
      return;
    }

    const searchParams: ExperienceSearchParams = {
      locationId: formValue.locationId,
      startDate: this.formatDate(formValue.startDate),
      endDate: this.formatDate(formValue.endDate),
      participants: formValue.participants
    };

    // Navigate to results page with search parameters
    this.router.navigate(['/experiences/results'], { 
      queryParams: searchParams 
    });
  }

  /**
   * Format date for API
   */
  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  /**
   * Mark all form fields as touched
   */
  private markFormGroupTouched(): void {
    Object.keys(this.searchForm.controls).forEach(key => {
      const control = this.searchForm.get(key);
      control?.markAsTouched();
    });
  }

  /**
   * Get field error message
   */
  getFieldError(fieldName: string): string {
    const field = this.searchForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} est requis`;
      if (field.errors['min']) return `Valeur minimale: ${field.errors['min'].min}`;
      if (field.errors['max']) return `Valeur maximale: ${field.errors['max'].max}`;
    }
    return '';
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