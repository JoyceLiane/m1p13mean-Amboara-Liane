// src/app/components/shop-dashboard/shop-dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { ShopStatisticsService, VenteStatistics, ProduitPopulaire, VenteRecente, RevenusParJour } from '../../services/shop-statistics.service';
import { ContratService } from '../../services/contrat.service';
import { UrlHelper } from '../../services/url.helper';

@Component({
  selector: 'app-shop-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './shop-dashboard.html',
  styleUrls: ['./shop-dashboard.css'],
})
export class ShopDashboard implements OnInit {
  // État de chargement
  isLoading = true;
  isDarkMode = false;

  // Données du contrat
  contratActif: any = null;
  
  // Statistiques
  statistics: VenteStatistics = {
    totalVentes: 0,
    totalRevenu: 0,
    ventesAujourdhui: 0,
    revenusAujourdhui: 0,
    ventesSemaine: 0,
    revenusSemaine: 0,
    ventesMois: 0,
    revenusMois: 0
  };

  topProduits: ProduitPopulaire[] = [];
  ventesRecentes: VenteRecente[] = [];
  revenusParJour: RevenusParJour[] = [];

  constructor(
    private router: Router,
    private authService: AuthService,
    public urlHelper: UrlHelper,
    private statsService: ShopStatisticsService,
    private contratService: ContratService
  ) {}

  ngOnInit() {
    this.checkDarkMode();
    this.loadDashboardData();
  }

  checkDarkMode() {
    this.isDarkMode = document.body.classList.contains('dark-mode');
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', this.isDarkMode ? 'true' : 'false');
  }

  async loadDashboardData() {
    try {
      const userId = this.authService.getUserId();
      if (!userId) {
        this.router.navigate(['/login']);
        return;
      }

      // Charger le contrat actif
      this.contratService.getContratActifByUser(userId).subscribe({
        next: (contrats) => {
          this.contratActif = contrats.find(c => 
            c.type_contrat === 'INITIAL' || c.type_contrat === 'RENOUVELLEMENT_ACTIF'
          );

          if (this.contratActif) {
            this.loadStatistics(this.contratActif._id);
          } else {
            this.isLoading = false;
          }
        },
        error: (err) => {
          console.error('Erreur chargement contrat:', err);
          this.isLoading = false;
        }
      });
    } catch (error) {
      console.error('Erreur:', error);
      this.isLoading = false;
    }
  }

  loadStatistics(contratId: string) {
    // Charger toutes les stats en parallèle
    this.statsService.getStatistics(contratId).subscribe({
      next: (stats) => {
        this.statistics = stats;
      },
      error: (err) => console.error('Erreur stats:', err)
    });

    this.statsService.getTopProduits(contratId, 5).subscribe({
      next: (produits) => {
        this.topProduits = produits;
      },
      error: (err) => console.error('Erreur top produits:', err)
    });

    this.statsService.getVentesRecentes(contratId, 10).subscribe({
      next: (ventes) => {
        this.ventesRecentes = ventes;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur ventes récentes:', err);
        this.isLoading = false;
      }
    });

    this.statsService.getRevenusParJour(contratId, 7).subscribe({
      next: (revenus) => {
        this.revenusParJour = revenus;
      },
      error: (err) => console.error('Erreur revenus par jour:', err)
    });
  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }

  goToProduits() {
    this.router.navigate(['/shop-produits']);
  }

  logout() {
    this.authService.logout();
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('mg-MG', {
      style: 'currency',
      currency: 'MGA'
    }).format(value);
  }


  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatDateShort(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short'
    });
  }

  getMaxRevenu(): number {
    if (this.revenusParJour.length === 0) return 0;
    return Math.max(...this.revenusParJour.map(r => r.revenu));
  }

  getBarHeight(revenu: number): number {
    const max = this.getMaxRevenu();
    if (max === 0) return 0;
    return (revenu / max) * 100;
  }
}