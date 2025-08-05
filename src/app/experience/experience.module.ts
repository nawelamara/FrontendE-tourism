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

// Experience Module Components
import { ExperienceListComponent } from './components/experience-list/experience-list.component';
import { ExperienceDetailComponent } from './components/experience-detail/experience-detail.component';
import { ExperienceFormComponent } from './components/experience-form/experience-form.component';

// Routing
import { ExperienceRoutingModule } from './experience-routing.module';

// Services
import { ExperienceService } from './services/experience.service';

@NgModule({
  declarations: [
    ExperienceListComponent,
    ExperienceDetailComponent,
    ExperienceFormComponent
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
    MatToolbarModule
  ],
  providers: [
    ExperienceService
  ]
})
export class ExperienceModule { }