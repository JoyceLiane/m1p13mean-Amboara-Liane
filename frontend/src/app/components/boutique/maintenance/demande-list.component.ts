import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MaintenanceService ,DemandeMaintenance} from '../../../services/maintenance.service';
import { ReferenceDataService } from '../../../services/reference-data.service';
import { AuthService } from '../../../services/auth';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-demande-list',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule],
  templateUrl: './demande-list.component.html',
  styleUrls: ['./demande-list.component.css']
})
export class DemandeListComponent implements OnInit {
  demandes: DemandeMaintenance[] = [];
  demandesFiltrees: DemandeMaintenance[] = [];
  statuts: any[] = [];
  loading = true;
  filtreStatut = 'all';

  constructor(
    private maintenanceService: MaintenanceService,
    private referenceDataService: ReferenceDataService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadStatuts();
    this.loadDemandes();
  }

  loadStatuts(): void {
    this.referenceDataService.getStatuts().subscribe(statuts => {
      this.statuts = statuts;
    });
  }

  loadDemandes(): void {
    this.loading = true;
    this.maintenanceService.getAllDemandes().subscribe({
      next: (demandes) => {
        const currentUser = this.authService.getCurrentUser();
        this.demandes = demandes.filter(d => 
          d.contrat_id?.locataire_id?._id === currentUser?._id
        );
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
    if (this.filtreStatut === 'all') {
      this.demandesFiltrees = this.demandes;
    } else {
      this.demandesFiltrees = this.demandes.filter(
        d => d.statut_id?._id === this.filtreStatut
      );
    }
  }

  getStatutClass(statut: any): string {
    return statut?.nom?.toLowerCase().replace('_', '-') || '';
  }

  nouvelleDemande(): void {
    this.router.navigate(['/maintenance/nouvelle']);
  }

  voirDetails(id: string | undefined): void {
    if (id) {
      this.router.navigate(['/maintenance', id]);
    }
  }
}