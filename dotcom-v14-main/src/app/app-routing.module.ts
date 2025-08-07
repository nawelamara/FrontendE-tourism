import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule)
  },
  {
    path: 'hotels',
    loadChildren: () => import('./hotels/hotels.module').then(m => m.HotelsModule)
  },
  {
    path: 'flights',
    loadChildren: () => import('./flights/flights.module').then(m => m.FlightsModule)
  },
  {
    path: 'packages',
    loadChildren: () => import('./packages/packages.module').then(m => m.PackagesModule)
  },
  {
    path: 'experiences',
    loadChildren: () => import('./experience/experience.module').then(m => m.ExperienceModule)
  },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule)
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }