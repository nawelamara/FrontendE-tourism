import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

// Angular Material Modules
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';

// Experience Module Components
import { ExperienceSearchComponent } from './components/experience-search/experience-search.component';
import { ExperienceResultsComponent } from './components/experience-results/experience-results.component';
import { ExperienceListComponent } from './components/experience-list/experience-list.component';
import { ExperienceDetailComponent } from './components/experience-detail/experience-detail.component';
import { ExperienceFormComponent } from './components/experience-form/experience-form.component';
import { ExperienceAdminComponent, ConfirmDialogComponent } from './components/experience-admin/experience-admin.component';

// Routing
import { ExperienceRoutingModule } from './experience-routing.module';

// Services
import { ExperienceService } from './services/experience.service';

@NgModule({
  declarations: [
    ExperienceSearchComponent,
    ExperienceResultsComponent,
    ExperienceListComponent,
    ExperienceDetailComponent,
    ExperienceFormComponent,
    ExperienceAdminComponent,
    ConfirmDialogComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule,
    ExperienceRoutingModule,
    // Angular Material
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatIconModule,
    MatChipsModule,
    MatPaginatorModule,
    MatToolbarModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSlideToggleModule,
    MatTableModule,
    MatTooltipModule
  ],
  providers: [
    ExperienceService
  ]
})
export class ExperienceModule { }