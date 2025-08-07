import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ExperienceSearchComponent } from './components/experience-search/experience-search.component';
import { ExperienceResultsComponent } from './components/experience-results/experience-results.component';
import { ExperienceListComponent } from './components/experience-list/experience-list.component';
import { ExperienceDetailComponent } from './components/experience-detail/experience-detail.component';
import { ExperienceFormComponent } from './components/experience-form/experience-form.component';
import { ExperienceAdminComponent } from './components/experience-admin/experience-admin.component';

const routes: Routes = [
  {
    path: '',
    component: ExperienceSearchComponent
  },
  {
    path: 'results',
    component: ExperienceResultsComponent
  },
  {
    path: 'admin',
    component: ExperienceAdminComponent
  },
  {
    path: 'list',
    component: ExperienceListComponent
  },
  {
    path: 'new',
    component: ExperienceFormComponent,
    data: { mode: 'create' }
  },
  {
    path: ':id',
    component: ExperienceDetailComponent
  },
  {
    path: ':id/edit',
    component: ExperienceFormComponent,
    data: { mode: 'edit' }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ExperienceRoutingModule { }