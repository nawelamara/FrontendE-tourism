import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';

import { ExperienceService } from '../../services/experience.service';
import { Experience, ExperienceCategory, DifficultyLevel } from '../../models/experience.interface';

@Component({
  selector: 'app-experience-form',
  templateUrl: './experience-form.component.html',
  styleUrls: ['./experience-form.component.scss']
})
export class ExperienceFormComponent implements OnInit, OnDestroy {
  experienceForm: FormGroup;
  isEditMode = false;
  experienceId: string | null = null;
  
  categories = Object.values(ExperienceCategory);
  difficulties = Object.values(DifficultyLevel);
  currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY'];
  languages = ['English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Chinese', 'Japanese'];
  
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private experienceService: ExperienceService,
    private snackBar: MatSnackBar
  ) {
    this.experienceForm = this.createForm();
  }

  ngOnInit(): void {
    this.checkMode();
    if (this.isEditMode) {
      this.loadExperience();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Create reactive form with validation
   */
  private createForm(): FormGroup {
    return this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      shortDescription: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(200)]],
      description: ['', [Validators.required, Validators.minLength(50), Validators.maxLength(2000)]],
      location: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      duration: [1, [Validators.required, Validators.min(0.5), Validators.max(168)]], // Max 1 week
      price: [0, [Validators.required, Validators.min(0), Validators.max(10000)]],
      currency: ['USD', Validators.required],
      maxParticipants: [1, [Validators.required, Validators.min(1), Validators.max(100)]],
      category: ['', Validators.required],
      difficulty: ['', Validators.required],
      meetingPoint: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(200)]],
      cancellationPolicy: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(500)]],
      isActive: [true],
      images: this.fb.array([]),
      highlights: this.fb.array([]),
      included: this.fb.array([]),
      excluded: this.fb.array([]),
      languages: this.fb.array([])
    });
  }

  /**
   * Check if we're in edit or create mode
   */
  private checkMode(): void {
    this.experienceId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.experienceId;
  }

  /**
   * Load experience for editing
   */
  private loadExperience(): void {
    if (!this.experienceId) return;

    this.experienceService.getExperienceById(this.experienceId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (experience) => {
          this.populateForm(experience);
        },
        error: (error) => {
          this.showError('Failed to load experience for editing');
          console.error('Error loading experience:', error);
          this.router.navigate(['/experiences']);
        }
      });
  }

  /**
   * Populate form with experience data
   */
  private populateForm(experience: Experience): void {
    this.experienceForm.patchValue({
      title: experience.title,
      shortDescription: experience.shortDescription,
      description: experience.description,
      location: experience.location,
      duration: experience.duration,
      price: experience.price,
      currency: experience.currency,
      maxParticipants: experience.maxParticipants,
      category: experience.category,
      difficulty: experience.difficulty,
      meetingPoint: experience.meetingPoint,
      cancellationPolicy: experience.cancellationPolicy,
      isActive: experience.isActive
    });

    // Populate arrays
    this.setFormArray('images', experience.images);
    this.setFormArray('highlights', experience.highlights);
    this.setFormArray('included', experience.included);
    this.setFormArray('excluded', experience.excluded);
    this.setFormArray('languages', experience.languages);
  }

  /**
   * Set form array values
   */
  private setFormArray(arrayName: string, values: string[]): void {
    const formArray = this.experienceForm.get(arrayName) as FormArray;
    formArray.clear();
    values.forEach(value => {
      formArray.push(this.fb.control(value, Validators.required));
    });
  }

  /**
   * Get form array
   */
  getFormArray(arrayName: string): FormArray {
    return this.experienceForm.get(arrayName) as FormArray;
  }

  /**
   * Add item to form array
   */
  addArrayItem(arrayName: string): void {
    const formArray = this.getFormArray(arrayName);
    formArray.push(this.fb.control('', Validators.required));
  }

  /**
   * Remove item from form array
   */
  removeArrayItem(arrayName: string, index: number): void {
    const formArray = this.getFormArray(arrayName);
    formArray.removeAt(index);
  }

  /**
   * Submit form
   */
  onSubmit(): void {
    if (this.experienceForm.invalid) {
      this.markFormGroupTouched();
      this.showError('Please fix the form errors before submitting');
      return;
    }

    const formData = this.experienceForm.value;
    
    // Filter out empty array items
    ['images', 'highlights', 'included', 'excluded', 'languages'].forEach(arrayName => {
      formData[arrayName] = formData[arrayName].filter((item: string) => item.trim() !== '');
    });

    if (this.isEditMode) {
      this.updateExperience(formData);
    } else {
      this.createExperience(formData);
    }
  }

  /**
   * Create new experience
   */
  private createExperience(experienceData: any): void {
    this.experienceService.createExperience(experienceData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (experience) => {
          this.showSuccess('Experience created successfully');
          this.router.navigate(['/experiences', experience.id]);
        },
        error: (error) => {
          this.showError('Failed to create experience. Please try again.');
          console.error('Error creating experience:', error);
        }
      });
  }

  /**
   * Update existing experience
   */
  private updateExperience(experienceData: any): void {
    if (!this.experienceId) return;

    this.experienceService.updateExperience(this.experienceId, experienceData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (experience) => {
          this.showSuccess('Experience updated successfully');
          this.router.navigate(['/experiences', experience.id]);
        },
        error: (error) => {
          this.showError('Failed to update experience. Please try again.');
          console.error('Error updating experience:', error);
        }
      });
  }

  /**
   * Cancel form and navigate back
   */
  onCancel(): void {
    if (this.isEditMode && this.experienceId) {
      this.router.navigate(['/experiences', this.experienceId]);
    } else {
      this.router.navigate(['/experiences']);
    }
  }

  /**
   * Mark all form fields as touched to show validation errors
   */
  private markFormGroupTouched(): void {
    Object.keys(this.experienceForm.controls).forEach(key => {
      const control = this.experienceForm.get(key);
      control?.markAsTouched();

      if (control instanceof FormArray) {
        control.controls.forEach(arrayControl => {
          arrayControl.markAsTouched();
        });
      }
    });
  }

  /**
   * Get field error message
   */
  getFieldError(fieldName: string): string {
    const field = this.experienceForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['minlength']) return `${fieldName} is too short`;
      if (field.errors['maxlength']) return `${fieldName} is too long`;
      if (field.errors['min']) return `${fieldName} value is too low`;
      if (field.errors['max']) return `${fieldName} value is too high`;
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