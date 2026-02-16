import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { DashboardBanqueComponent } from './dashboard-banque/dashboard-banque.component';

export const dashboardRoutes: Routes = [
  {
    path: '',
    component: DashboardBanqueComponent,
    data: {
        title: "Tableau de bord",
        breadcrumb: "Tableau de bord",
    }
  }
]
