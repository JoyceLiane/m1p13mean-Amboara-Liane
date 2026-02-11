import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { ClientDashboard } from './components/client-dashboard/client-dashboard';
import { ProfileComponent } from './pages/profile/profile';
import { ShopDashboard } from './components/shop-dashboard/shop-dashboard';
<<<<<<< Updated upstream
import { ProduitsMagasinComponent } from './components/produits-magasin/produits-magasin';
=======
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
>>>>>>> Stashed changes
export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'client-dashboard', component: ClientDashboard },
  { path: 'admin-dashboard', component: AdminDashboardComponent },
  { path: 'shop-dashboard', component: ShopDashboard },
  { path: 'profile', component: ProfileComponent },
<<<<<<< Updated upstream
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'magasin/:id/produits', component: ProduitsMagasinComponent }
  
];
=======
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];
>>>>>>> Stashed changes
