import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { ClientDashboard } from './components/client-dashboard/client-dashboard';
import { ProfileComponent } from './pages/profile/profile';
export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'client-dashboard', component: ClientDashboard },
  { path: 'profile', component: ProfileComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];
