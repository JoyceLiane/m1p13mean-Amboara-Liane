import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MaintenanceService, DemandeMaintenance } from '../../../services/maintenance.service';
import { ReferenceDataService } from '../../../services/reference-data.service';
import { CommonModule } from '@angular/common';  // ← IMPORTANT



@Component({
  selector: 'app-maintenance-planification',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './maintenance-planification.component.html',
  styleUrls: ['./maintenance-planification.component.css']
})
export class MaintenancePlanificationComponent implements OnInit {
  planificationForm: FormGroup;
  demande: DemandeMaintenance | null = null;
  loading = true;
  saving = false;
  demandeId: string;
   today: string = new Date().toISOString().split('T')[0];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private maintenanceService: MaintenanceService,
    private referenceDataService: ReferenceDataService,
    private snackBar: MatSnackBar
  ) {
    this.demandeId = this.route.snapshot.paramMap.get('id') || '';
    
    this.planificationForm = this.fb.group({
      date_intervention: ['', Validators.required],
      cout: ['', [Validators.required, Validators.min(0)]],
      notes: ['']
    });
  }

  ngOnInit(): void {
    if (this.demandeId) {
      this.loadDemande();
    }
  }

  loadDemande(): void {
    this.loading = true;
    this.maintenanceService.getDemandeById(this.demandeId).subscribe({
      next: (demande) => {
        this.demande = demande;
        this.loading = false;
        
        // Pré-remplir si déjà planifié
        if (demande.date_intervention) {
          this.planificationForm.patchValue({
            date_intervention: demande.date_intervention,
            cout: demande.cout || ''
          });
        }
      },
      error: (err) => {
        console.error('Erreur chargement demande', err);
        this.loading = false;
        this.snackBar.open('Erreur lors du chargement de la demande', 'Fermer', { duration: 3000 });
      }
    });
  }

  onSubmit(): void {
    if (this.planificationForm.invalid) {
      return;
    }

    this.saving = true;
    const { date_intervention, cout } = this.planificationForm.value;

    this.maintenanceService.planifierIntervention(this.demandeId, date_intervention, cout).subscribe({
      next: (response) => {
        this.snackBar.open('Intervention planifiée avec succès', 'Fermer', { duration: 3000 });
        this.router.navigate(['/admin/maintenance', this.demandeId]);
      },
      error: (err) => {
        console.error('Erreur planification', err);
        this.snackBar.open('Erreur lors de la planification', 'Fermer', { duration: 3000 });
        this.saving = false;
      }
    });
  }

  getUrgenceColor(urgence: any): string {
    return urgence?.couleur || '#999';
  }

  getDelaiMaxMessage(urgence: any): string {
    if (!urgence?.delai_max_jours) return '';
    const dateLimite = new Date(this.demande!.date_demande!);
    dateLimite.setDate(dateLimite.getDate() + urgence.delai_max_jours);
    return `Intervention recommandée avant le ${dateLimite.toLocaleDateString()}`;
  }

  annuler(): void {
    this.router.navigate(['/admin/maintenance', this.demandeId]);
  }
}