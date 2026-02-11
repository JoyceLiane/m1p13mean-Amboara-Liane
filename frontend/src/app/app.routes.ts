import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { ClientDashboard } from './components/client-dashboard/client-dashboard';
import { ProfileComponent } from './pages/profile/profile';
import { ShopDashboard } from './components/shop-dashboard/shop-dashboard';
import { ProduitsMagasinComponent } from './components/produits-magasin/produits-magasin';
export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'client-dashboard', component: ClientDashboard },
  { path: 'shop-dashboard', component: ShopDashboard },
  { path: 'profile', component: ProfileComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'magasin/:id/produits', component: ProduitsMagasinComponent }
  
];
