import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';
import { PanierComponent } from './components/panier/panier';
export const routes: Routes = [
  // Page de login (publique)
  { path: 'login', component: LoginComponent },
  {
    path: 'new-boutique',
    loadComponent: () => import('./components/inscription-boutique/inscription-boutique')
      .then(m => m.InscriptionBoutiqueComponent)
  },
  {
    path: 'landing',
    loadComponent: () => import('./components/landing-page/landing-page')
      .then(m => m.LandingPage)
  },
  {
    path: 'register',
    loadComponent: () => import('./components/register/register')
      .then(m => m.RegisterComponent)
  },
  {
    path: 'create-produit',
    loadComponent: () => import('./components/shop-dashboard/pages/create-produit/create-produit')
      .then(m => m.CreateProduitComponent)
  },
  // Page non autorisée (optionnelle)
  {
    path: 'non-autorise',
    loadComponent: () => import('./components/not-found/not-found.component').then(m => m.NotFoundComponent)
  },

  // Routes protégées avec layout
  {
    path: '',
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
      { path: 'panier', component: PanierComponent, canActivate: [AuthGuard] },

      // Client uniquement
      {
        path: 'client-dashboard',
        loadComponent: () => import('./components/carte-supermarche/carte-supermarche').then(m => m.CarteSupermarcheComponent),
        canActivate: [RoleGuard],
        data: { roles: ['client'] }
      },
      {
        path: 'carte-supermarche',
        loadComponent: () => import('./components/carte-supermarche/carte-supermarche').then(m => m.CarteSupermarcheComponent),
        canActivate: [RoleGuard],
        data: { roles: ['client'] }
      },

      // Routes pour les boutiques (maintenance)
      {
        path: 'shop-dashboard',
        loadComponent: () => import('./components/shop-dashboard/shop-dashboard').then(m => m.ShopDashboard),
        canActivate: [RoleGuard],
        data: { roles: ['shop', 'boutique'] }
      },
      {
        path: 'shop-produits',
        loadComponent: () => import('./components/shop-dashboard/pages/produits/produits').then(m => m.ProduitsPageComponent),
        canActivate: [RoleGuard],
        data: { roles: ['shop', 'boutique'] }
      },

      // ROUTES DE MAINTENANCE POUR LES BOUTIQUES
      {
        path: 'maintenance',
        canActivate: [RoleGuard],
        data: { roles: ['boutique'] }, // Les boutiques et admin peuvent accéder
        children: [
          {
            path: '',
            loadComponent: () => import('./components/boutique/maintenance/demande-list.component')
              .then(m => m.DemandeListComponent)
          },
          {
            path: 'nouvelle',
            loadComponent: () => import('./components/boutique/maintenance/demande-form.component')
              .then(m => m.DemandeFormComponent)
          },
          {
            path: 'modifier/:id',
            loadComponent: () => import('./components/boutique/maintenance/demande-form.component')
              .then(m => m.DemandeFormComponent)
          }

        ]
      },
      {
        path: 'mes-contrats',
        canActivate: [RoleGuard],
        data: { roles: ['boutique'] }, // Les boutiques et admin peuvent accéder
        children: [
          {
            path: '',
            loadComponent: () => import('./components/boutique/contrats/mes-contrats.component')
              .then(m => m.MesContratsComponent)
          },
          {
            path: ':id',
            loadComponent: () => import('./components/boutique/contrats/contrat-detail.component')
              .then(m => m.ContratDetailComponent)
          }
        ]
      },
      {
        path: 'contrats',
        canActivate: [RoleGuard],
        data: { roles: ['admin'] }, // Les boutiques et admin peuvent accéder
        children: [
          {
            path: '',
            loadComponent: () => import('./components/admin/contrat/contrat-list.component')
              .then(m => m.ContratListComponent)
          }
        ]
      },
      {
        path: 'demandes-renouvellement',
        canActivate: [RoleGuard],
        data: { roles: ['admin'] },
        children: [

          {
            path: '',
            loadComponent: () => import('./components/admin/contrat/demandes-renouvellement.component')
              .then(m => m.DemandesRenouvellementComponent)
          },
          {
            path: ':id',
            loadComponent: () => import('./components/admin/contrat/demande-detail.component')
              .then(m => m.DemandeDetailComponent)
          }
        ]
      },
      {
        path: 'nouveaux-contrats',
        canActivate: [RoleGuard],
        data: { roles: ['admin'] },
        children: [

          {
            path: '',
            loadComponent: () => import('./components/admin/contrat//nouveaux/nouveau-contrat')
              .then(m => m.NouveauContratComponent)
          }
        ]
      },
      {
        path: 'shop-mouvement-stock/:produitId',
        loadComponent: () =>
          import('./components/shop-dashboard/pages/mouvement-stock/mouvement-stock')
            .then(m => m.MouvementStockPageComponent),
        data: { roles: ['boutique'] }
      },

      {
        path: 'admin/events',
        canActivate: [RoleGuard],
        data: { roles: ['admin'] },
        children: [
          {
            path: '',
            loadComponent: () => import('./components/admin/events/event.component').then(m => m.EventsComponent)
          },
          {
            path: 'new',
            loadComponent: () => import('./components/admin/events/event-form.component').then(m => m.EventFormComponent)
          },
          {
            path: 'edit/:id',
            loadComponent: () => import('./components/admin/events/event-form.component').then(m => m.EventFormComponent)
          },
          {
            path: ':id',
            loadComponent: () => import('./components/admin/events/event-detail.component').then(m => m.EventDetailComponent)
          }
        ]
      },
      {
        path: 'paiements',
        canActivate: [RoleGuard],
        data: { roles: ['admin'] },
        children: [
          {
            path: '',
            loadComponent: () => import('./components/admin/paiement/paiement-list.component').then(m => m.PaiementListAdminComponent)
          },
          {
            path: 'new',
            loadComponent: () => import('./components/admin/paiement/paiement-form.component').then(m => m.PaiementFormComponent)
          },
          {
            path: 'edit/:id',
            loadComponent: () => import('./components/admin/paiement/paiement-form.component').then(m => m.PaiementFormComponent)
          },
          {
            path: ':id',
            loadComponent: () => import('./components/admin/paiement/paiement-detail.component').then(m => m.PaiementDetailComponent)
          }
        ]
      },
      {
        path: 'owner/paiements',
        canActivate: [RoleGuard],
        data: { roles: ['boutique'] },
        children: [
          {
            path: '',
            loadComponent: () => import('./components/boutique/paiement/paiement-list-owner.component').then(m => m.PaiementListOwnerComponent)
          },
          {
            path: ':id',
            loadComponent: () => import('./components/boutique/paiement/paiement-detail-owner.component').then(m => m.PaiementDetailOwnerComponent)
          }
        ]
      },

      // ROUTES ADMIN POUR LA GESTION DES MAINTENANCES
      {
        path: 'admin/maintenance',
        canActivate: [RoleGuard],
        data: { roles: ['admin'] },
        children: [
          {
            path: '',
            loadComponent: () => import('./components/admin/maintenance/maintenance-list.component')
              .then(m => m.MaintenanceListComponent)
          },
          {
            path: 'planifier/:id',
            loadComponent: () => import('./components/admin/maintenance/maintenance-planification.component')
              .then(m => m.MaintenancePlanificationComponent)
          },
          {
            path: ':id',
            loadComponent: () => import('./components/admin/maintenance/demande-detail.component')
              .then(m => m.DemandeDetailComponent)
          }
        ]
      },

      // Redirection par défaut
      {
        path: '',
        loadComponent: () => import('./components/dashboard-redirect/dashboard-redirect')
          .then(m => m.DashboardRedirectComponent)
      }
    ]
  },

  // Redirection racine
  { path: '', redirectTo: '/landing', pathMatch: 'full' },

  // Wildcard (404)
  {
    path: '**',
    loadComponent: () => import('./components/not-found/not-found.component').then(m => m.NotFoundComponent)
  }
];