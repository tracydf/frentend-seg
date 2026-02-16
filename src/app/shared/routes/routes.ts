import { Routes } from '@angular/router';

export const dashData: Routes = [
    {
        path: 'pages',
        data: {
            title: "pages",
            breadcrumb: "pages",

        },
        loadChildren: () => import('../../../app/component/pages/pages.routes').then(r => r.pages)
    },
    {
        path: 'dashboard',
        data: {
            title: "Tableau de bord",
            breadcrumb: "Tableau de bord",

        },
        loadChildren: () => import('../../../app/component/dashboard/dashboard.routes').then(r => r.dashboardRoutes)
    },
]