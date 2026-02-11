import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { LayoutComponent } from './components/layout/layout.component';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';

export const routes: Routes = [
  // Page de login (publique)
  { path: 'login', component: LoginComponent },
  
  // Page non autorisée (optionnelle)
  { 
    path: 'non-autorise', 
    loadComponent: () => import('./components/not-found/not-found.component').then(m => m.NotFoundComponent) 
  },

  // Routes protégées avec layout
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard], // AuthGuard protège TOUTES les routes enfants
    children: [
      // Admin uniquement
      { 
        path: 'admin-dashboard', 
        loadComponent: () => import('./components/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
        canActivate: [RoleGuard],
        data: { roles: ['admin'] }
      },
      { 
        path: 'profile', 
        loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent),
        canActivate: [RoleGuard],
        data: { roles: ['admin', 'client', 'shop', 'boutique'] } // Tous les rôles
      },
      
      // Client uniquement
      // { 
      //   path: 'client-dashboard', 
      //   loadComponent: () => import('./components/client-dashboard/client-dashboard').then(m => m.ClientDashboardComponent),
      //   canActivate: [RoleGuard],
      //   data: { roles: ['client'] }
      // },
      { 
        path: 'carte-supermarche', 
        loadComponent: () => import('./components/carte-supermarche/carte-supermarche').then(m => m.CarteSupermarcheComponent),
        canActivate: [RoleGuard],
        data: { roles: ['client'] }
      },
      { 
        path: 'produits-magasin', 
        loadComponent: () => import('./components/produits-magasin/produits-magasin').then(m => m.ProduitsMagasinComponent),
        canActivate: [RoleGuard],
        data: { roles: ['client'] }
      },
      
      // Shop uniquement
      // { 
      //   path: 'shop-dashboard', 
      //   loadComponent: () => import('./components/shop-dashboard/shop-dashboard').then(m => m.ShopDashboardComponent),
      //   canActivate: [RoleGuard],
      //   data: { roles: ['shop', 'boutique'] }
      // },
      
      // Redirection par défaut
      { 
        path: '', 
        redirectTo: '/admin-dashboard', 
        pathMatch: 'full' 
      }
    ]
  },
  
  // Redirection racine
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  
  // Wildcard (404)
  { 
    path: '**', 
    loadComponent: () => import('./components/not-found/not-found.component').then(m => m.NotFoundComponent) 
  }
];