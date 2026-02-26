import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule, DecimalPipe, DatePipe } from '@angular/common';
import { Paiement, PaiementService } from '../../../services/paiement.service';

@Component({
  selector: 'app-paiement-list-admin',
  standalone: true,
  imports: [
    CommonModule, 
    RouterLink 
  ],
  providers: [
    DecimalPipe, 
    DatePipe 
  ],
  templateUrl: './paiement-list.component.html',
  styleUrl: './paiement-list.component.css'

})
export class PaiementListAdminComponent implements OnInit {
  paiements: Paiement[] = [];
  filteredPaiements: Paiement[] = [];
  loading = false;
  totalMontant = 0;
  
  // Pagination
  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  
  // Modal
  modalSuppressionOuvert = false;
  paiementASupprimer: string | null = null;

  constructor(
    private paiementService: PaiementService,
    private router: Router,
    private decimalPipe: DecimalPipe, // Injection du pipe
    private datePipe: DatePipe // Injection du pipe date
  ) {}

  ngOnInit(): void {
    this.loadPaiements();
  }

  get dataSource() {
    return {
      data: this.paiements,
      filteredData: this.filteredPaiements
    };
  }

  // Méthode pour formater les nombres
  formatNumber(value: number): string {
    if (value === null || value === undefined) return '';
    return this.decimalPipe.transform(value, '1.0-0') || value.toString();
  }

  // Méthode pour formater les dates
  formatDate(date: Date | string, format: string = 'dd/MM/yyyy'): string {
    if (!date) return '';
    return this.datePipe.transform(date, format) || '';
  }

  loadPaiements(): void {
    this.loading = true;
    this.paiementService.getAllPaiements().subscribe({
      next: (paiements) => {
        this.paiements = paiements;
        this.filteredPaiements = [...paiements];
        this.calculerTotal(paiements);
        this.updatePagination();
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement paiements', err);
        this.loading = false;
      }
    });
  }

  calculerTotal(paiements: Paiement[]): void {
    this.totalMontant = paiements.reduce((sum, p) => sum + p.montant, 0);
  }

  applyFilter(event: any): void {
    const filterValue = event.target.value.toLowerCase();
    this.filteredPaiements = this.paiements.filter(p => {
      const magasin = typeof p.contrat_id !== 'string' ? p.contrat_id.nom_magasin : '';
      const locataire = typeof p.contrat_id !== 'string' && p.contrat_id.locataire_id ? 
                        p.contrat_id.locataire_id.nom : '';
      return magasin.toLowerCase().includes(filterValue) || 
             locataire.toLowerCase().includes(filterValue);
    });
    this.currentPage = 0;
    this.updatePagination();
  }

  getMoisConcerne(paiement: Paiement): string {
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

  // Actions
  voirDetails(id: string): void {
    this.router.navigate(['/paiements', id]);
  }

  modifierPaiement(id: string): void {
    this.router.navigate(['/paiements/edit', id]);
  }

  supprimerPaiement(id: string): void {
    this.paiementASupprimer = id;
    this.modalSuppressionOuvert = true;
  }

  fermerModalSuppression(): void {
    this.modalSuppressionOuvert = false;
    this.paiementASupprimer = null;
  }

  confirmerSuppression(): void {
    if (this.paiementASupprimer) {
      this.paiementService.deletePaiement(this.paiementASupprimer).subscribe({
        next: () => {
          this.fermerModalSuppression();
          this.loadPaiements();
        },
        error: (err) => {
          console.error('Erreur suppression', err);
          this.fermerModalSuppression();
        }
      });
    }
  }
}