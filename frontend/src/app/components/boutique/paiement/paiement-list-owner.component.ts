import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Paiement, PaiementService } from '../../../services/paiement.service';
import { ContratService } from '../../../services/contrat.service';
import { AuthService } from '../../../services/auth';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-paiement-list-shop',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './paiement-list-owner.component.html',
  styleUrls: ['./paiement-list-owner.component.css']
})
export class PaiementListOwnerComponent implements OnInit {
  paiements: any[] = [];
  filteredPaiements: any[] = [];
  situations: Map<string, any> = new Map(); // Stocker les situations par contrat
  contrats: any[] = [];
  loading = false;
  errorMessage: string | null = null;
  totalMontant = 0;
  
  stats = {
    total: 0,
    ceMois: 0,
    enRetard: 0
  };
  
  // Filtres
  filtreMagasin: string = '';
  filtrePeriode: string = 'tout';
  
  // Pagination
  currentPage = 0;
  pageSize = 10;
  totalPages = 0;

  constructor(
    private paiementService: PaiementService,
    private contratService: ContratService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProprietaireData();
  }

loadProprietaireData(): void {
  this.loading = true;
  this.errorMessage = null;
  
  // Vérifier si l'utilisateur est connecté
  if (!this.authService.isAuthenticated()) {
    this.errorMessage = 'Vous devez être connecté pour accéder à cette page';
    this.loading = false;
    setTimeout(() => this.router.navigate(['/login']), 3000);
    return;
  }

  // Vérifier le rôle (shop ou boutique)
  if (!this.authService.isShop()) {
    this.errorMessage = 'Accès réservé aux propriétaires de boutique';
    this.loading = false;
    setTimeout(() => this.router.navigate(['/']), 3000);
    return;
  }

  // Récupérer l'ID du propriétaire
  const proprietaireId = this.authService.getUserId();
  
  if (!proprietaireId) {
    this.errorMessage = 'Propriétaire non identifié - ID manquant';
    this.loading = false;
    console.error('ID propriétaire manquant');
    return;
  }

  console.log('Chargement des contrats pour le propriétaire (ID):', proprietaireId);

  // 1. Récupérer tous les contrats du propriétaire (via locataire_id)
  this.contratService.getContratsByLocataire(proprietaireId).subscribe({
    next: (contrats) => {
      console.log('Contrats trouvés:', contrats);
      this.contrats = contrats;
      
      if (contrats.length === 0) {
        this.errorMessage = 'Aucun contrat trouvé pour ce propriétaire';
        this.loading = false;
        return;
      }
      
      // 2. Filtrer les contrats avec ID valide
      const contratsAvecId = contrats.filter(c => c._id && typeof c._id === 'string');

      if (contratsAvecId.length === 0) {
        this.errorMessage = 'Aucun contrat valide trouvé';
        this.loading = false;
        return;
      }

      // 3. Pour chaque contrat valide, récupérer sa situation
      const situationRequests = contratsAvecId.map(contrat => 
        this.paiementService.getSituationPaiement(contrat._id as string)
      );

      // Exécuter toutes les requêtes en parallèle
      forkJoin(situationRequests).subscribe({
        next: (situations) => {
          console.log('Situations trouvées:', situations);
          
          // Stocker les situations par contrat
          situations.forEach(situation => {
            if (situation && situation.contrat) {
              this.situations.set(situation.contrat._id, situation);
            }
          });
          
          // Récupérer tous les paiements
          this.paiements = situations.reduce<Paiement[]>((acc, situation) => {
            if (situation && situation.paiements) {
              return acc.concat(situation.paiements);
            }
            return acc;
          }, []);
          
          console.log('Tous les paiements:', this.paiements);
          this.filteredPaiements = [...this.paiements];
          this.calculerStatistiques();
          this.loading = false;
          
          if (this.paiements.length === 0) {
            this.errorMessage = 'Aucun paiement trouvé pour vos contrats';
          }
        },
        error: (err) => {
          console.error('Erreur chargement situations:', err);
          this.errorMessage = 'Erreur lors du chargement des situations de paiement';
          this.loading = false;
        }
      });
    },
    error: (err) => {
      console.error('Erreur chargement contrats:', err);
      this.errorMessage = 'Erreur lors du chargement des contrats';
      this.loading = false;
    }
  });
}

  // Méthode pour récupérer la situation d'un contrat spécifique
  getSituationForContrat(contratId: string): any {
    return this.situations.get(contratId);
  }

  // Méthode pour vérifier si un contrat est à jour
  isContratAJour(contratId: string): boolean {
    const situation = this.situations.get(contratId);
    return situation?.situation?.est_a_jour || false;
  }

  // Méthode pour récupérer les mois à venir d'un contrat
  getMoisAVenir(contratId: string): any[] {
    const situation = this.situations.get(contratId);
    return situation?.situation?.mois_a_venir || [];
  }

  // Méthode pour récupérer le total payé d'un contrat
  getTotalPayeContrat(contratId: string): number {
    const situation = this.situations.get(contratId);
    return situation?.situation?.total_paye || 0;
  }

  // Méthode pour récupérer le dernier mois payé
  getDernierMoisPaye(contratId: string): Date | null {
    const situation = this.situations.get(contratId);
    return situation?.situation?.dernier_mois_paye || null;
  }

  // Méthode pour réessayer
  retry(): void {
    this.loadProprietaireData();
  }

  calculerStatistiques(): void {
    this.totalMontant = this.paiements.reduce((sum, p) => sum + p.montant, 0);
    
    const aujourdhui = new Date();
    const moisActuel = aujourdhui.getMonth();
    const anneeActuelle = aujourdhui.getFullYear();
    
    // Paiements du mois en cours
    this.stats.ceMois = this.paiements.filter(p => {
      const datePaiement = new Date(p.date_paiement);
      return datePaiement.getMonth() === moisActuel && 
             datePaiement.getFullYear() === anneeActuelle;
    }).length;
    
    // Paiements en retard (basé sur les situations)
    let totalRetard = 0;
    this.situations.forEach(situation => {
      if (situation.situation?.mois_a_venir) {
        totalRetard += situation.situation.mois_a_venir.filter((m: any) => m.estEnRetard).length;
      }
    });
    this.stats.enRetard = totalRetard;
  }

  applyFilters(): void {
    this.filteredPaiements = this.paiements.filter(p => {
      const contrat = this.getContratInfo(p);
      const magasin = contrat ? this.getMagasinInfo(contrat) : null;
      const nomMagasin = magasin?.nom || contrat?.nom_magasin || '';
      
      // Filtre par magasin
      const matchMagasin = !this.filtreMagasin || 
        nomMagasin.toLowerCase().includes(this.filtreMagasin.toLowerCase());
      
      // Filtre par période
      let matchPeriode = true;
      if (this.filtrePeriode !== 'tout') {
        const datePaiement = new Date(p.date_paiement);
        const aujourdhui = new Date();
        
        switch(this.filtrePeriode) {
          case 'mois':
            matchPeriode = datePaiement.getMonth() === aujourdhui.getMonth() &&
                          datePaiement.getFullYear() === aujourdhui.getFullYear();
            break;
          case 'trimestre':
            const trimestreActuel = Math.floor(aujourdhui.getMonth() / 3);
            const trimestrePaiement = Math.floor(datePaiement.getMonth() / 3);
            matchPeriode = trimestrePaiement === trimestreActuel &&
                          datePaiement.getFullYear() === aujourdhui.getFullYear();
            break;
          case 'annee':
            matchPeriode = datePaiement.getFullYear() === aujourdhui.getFullYear();
            break;
        }
      }
      
      return matchMagasin && matchPeriode;
    });
    
    this.currentPage = 0;
    this.updatePagination();
  }

  getContratInfo(paiement: any): any {
    if (!paiement || typeof paiement.contrat_id === 'string') {
      return null;
    }
    return paiement.contrat_id;
  }

  getMagasinInfo(contrat: any): any {
    if (!contrat || typeof contrat.id_magasin === 'string') {
      return null;
    }
    return contrat.id_magasin;
  }

  getLocataireInfo(paiement: any): any {
    const contrat = this.getContratInfo(paiement);
    if (!contrat || typeof contrat.locataire_id === 'string') {
      return null;
    }
    return contrat.locataire_id;
  }

  onSearch(event: any): void {
    this.filtreMagasin = event.target.value;
    this.applyFilters();
  }

  onPeriodeChange(event: any): void {
    this.filtrePeriode = event.target.value;
    this.applyFilters();
  }

  formatNumber(value: number): string {
    if (value === null || value === undefined) return '0';
    return new Intl.NumberFormat('fr-FR').format(value);
  }

  formatDate(date: Date | string): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  getMoisConcerne(paiement: any): string {
    const debut = new Date(paiement.mois_concerne_debut);
    const fin = new Date(paiement.mois_concerne_fin);
    
    if (paiement.nombre_mois === 1) {
      return debut.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    } else {
      return `${debut.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })} - ${fin.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}`;
    }
  }

  getStatutColor(statut: string): string {
    switch(statut) {
      case 'validé': return '#e8f5e8';
      case 'en_attente': return '#fff3e0';
      case 'annulé': return '#ffebee';
      default: return '#f5f5f5';
    }
  }

  getStatutIcon(statut: string): string {
    switch(statut) {
      case 'validé': return 'mdi-check-circle';
      case 'en_attente': return 'mdi-clock-outline';
      case 'annulé': return 'mdi-cancel';
      default: return 'mdi-information';
    }
  }

  // Pagination
  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredPaiements.length / this.pageSize);
  }

  previousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
    }
  }

  voirDetails(id: string): void {
    this.router.navigate(['/shop/paiements', id]);
  }

  retour(): void {
    this.router.navigate(['/shop-dashboard']);
  }
}