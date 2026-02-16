import { Routes } from '@angular/router';
import { ContentComponent } from './shared/component/layout/content/content.component';
import { dashData } from './shared/routes/routes'
import { LoginComponent } from './auth/login/login.component';
import { ForgotPasswordComponent } from './auth/forgot-password/forgot-password.component';
import { RegisterComponent } from './auth/register/register.component';
import { AdminGuard } from './shared/guard/admin.guard';

export const routes: Routes = [
    {
        path: 'auth/login',
        component: LoginComponent
    },
    {
        path: 'auth/forgot-password',
        component: ForgotPasswordComponent
    },
    {
        path: 'auth/register',
        component: RegisterComponent
    },
    {
        path: '',
        loadChildren: () => import('./component/pages/home/home.routes').then(r => r.homeRoutes)
    },
    {
        path: '',
        component: ContentComponent,
        children: dashData,
        canActivate: [AdminGuard],

    },

];
