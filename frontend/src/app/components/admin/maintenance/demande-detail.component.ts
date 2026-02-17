import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MaintenanceService, DemandeMaintenance } from '../../../services/maintenance.service';
import { ReferenceDataService } from '../../../services/reference-data.service';

@Component({
  selector: 'app-demande-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './demande-detail.component.html',
  styleUrls: ['./demande-detail.component.css']
})
export class DemandeDetailComponent implements OnInit {
  demande: DemandeMaintenance | null = null;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private maintenanceService: MaintenanceService,
    private referenceDataService: ReferenceDataService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadDemande(id);
    }
  }

  loadDemande(id: string): void {
    this.loading = true;
    this.maintenanceService.getDemandeById(id).subscribe({
      next: (demande) => {
        this.demande = demande;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement demande', err);
        this.loading = false;
      }
    });
  }

  getStatutColor(statut: any): string {
    return statut?.couleur || '#999';
  }

  getUrgenceColor(urgence: any): string {
    return urgence?.couleur || '#999';
  }
  // Dans demande-detail.component.ts

  getDelaiMessage(urgence: any): string {
    if (!urgence?.delai_max_jours || !this.demande?.date_demande) return '';
    const dateLimite = new Date(this.demande.date_demande);
    dateLimite.setDate(dateLimite.getDate() + urgence.delai_max_jours);
    
    const aujourdhui = new Date();
    if (dateLimite < aujourdhui) {
      return `Délai dépassé (était le ${dateLimite.toLocaleDateString()})`;
    }
    return `À traiter avant le ${dateLimite.toLocaleDateString()}`;
  }

  // Dans demande-detail.component.ts
formatDate(date: Date | string | undefined): string {
  if (!date) return 'Date non spécifiée';
  
  try {
    const d = new Date(date);
    // Vérifier si la date est valide
    if (isNaN(d.getTime())) {
      return 'Date invalide';
    }
    return `${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')}/${d.getFullYear()}`;
  } catch (e) {
    return 'Date invalide';
  }
}
  voirLocataire(id: string | undefined): void {
    if (id) {
      this.router.navigate(['/admin/locataires', id]);
    }
  }

  retour(): void {
    this.router.navigate(['/admin/maintenance']);
  }

  planifier(): void {
    if (this.demande?._id) {
      this.router.navigate(['/admin/maintenance/planifier', this.demande._id]);
    }
  }

  imprimer(): void {
    window.print();
  }

  changerStatut(): void {
    // À implémenter
    console.log('Changer statut');
  }

  marquerTermine(): void {
    // À implémenter
    console.log('Marquer terminé');
  }
}