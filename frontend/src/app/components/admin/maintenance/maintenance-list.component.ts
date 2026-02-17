import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';  // ← IMPORTANT
import { FormsModule } from '@angular/forms';
import { MaintenanceService, DemandeMaintenance } from '../../../services/maintenance.service';
import { ReferenceDataService } from '../../../services/reference-data.service';

@Component({
  selector: 'app-maintenance-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './maintenance-list.component.html',
  styleUrls: ['./maintenance-list.component.css']
})
export class MaintenanceListComponent implements OnInit {
  demandes: DemandeMaintenance[] = [];
  demandesFiltrees: DemandeMaintenance[] = [];
  statuts: any[] = [];
  urgences: any[] = [];
  loading = true;
  
  filtreStatut = 'all';
  filtreUrgence = 'all';
  recherche = '';

  constructor(
    private maintenanceService: MaintenanceService,
    private referenceDataService: ReferenceDataService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadStatuts();
    this.loadUrgences();
    this.loadDemandes();
  }

  loadStatuts(): void {
    this.referenceDataService.getStatuts().subscribe(statuts => {
      this.statuts = statuts;
    });
  }

  loadUrgences(): void {
    this.referenceDataService.getUrgences().subscribe(urgences => {
      this.urgences = urgences;
    });
  }

  loadDemandes(): void {
    this.loading = true;
    this.maintenanceService.getAllDemandes().subscribe({
      next: (demandes) => {
        this.demandes = demandes;
        this.filtrerDemandes();
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement demandes', err);
        this.loading = false;
      }
    });
  }

  filtrerDemandes(): void {
    this.demandesFiltrees = this.demandes.filter(d => {
      const matchStatut = this.filtreStatut === 'all' || d.statut_id?._id === this.filtreStatut;
      const matchUrgence = this.filtreUrgence === 'all' || d.urgence_id?._id === this.filtreUrgence;
      const matchRecherche = this.recherche === '' || 
        d.description?.toLowerCase().includes(this.recherche.toLowerCase()) ||
        d.contrat_id?.nom_magasin?.toLowerCase().includes(this.recherche.toLowerCase());
      
      return matchStatut && matchUrgence && matchRecherche;
    });
  }

  getStatutClass(statut: any): string {
    return statut?.nom?.toLowerCase().replace('_', '-') || '';
  }

  planifierIntervention(id: string): void {
    this.router.navigate(['/admin/maintenance/planifier', id]);
  }

  voirDetails(id: string): void {
    this.router.navigate(['/admin/maintenance', id]);
  }

  getStatutNom(statutId: string): string {
    const statut = this.statuts.find(s => s._id === statutId);
    return statut?.nom || 'Inconnu';
  }

  getUrgenceNiveau(urgenceId: string): string {
    const urgence = this.urgences.find(u => u._id === urgenceId);
    return urgence?.niveau || 'Inconnu';
  }
}