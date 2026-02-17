import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MaintenanceService } from '../../../services/maintenance.service';
import { ReferenceDataService, Contrat } from '../../../services/reference-data.service';
import { AuthService } from '../../../services/auth';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-demande-form',
    imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './demande-form.component.html',
  styleUrls: ['./demande-form.component.css']
})
export class DemandeFormComponent implements OnInit {
  demandeForm: FormGroup;
  contrats: Contrat[] = [];
  urgences: any[] = [];
  isEditMode = false;
  demandeId: string | null = null;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private maintenanceService: MaintenanceService,
    private referenceDataService: ReferenceDataService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.demandeForm = this.fb.group({
      contrat_id: ['', Validators.required],
      description: ['', [Validators.required, Validators.minLength(10)]],
      urgence_id: ['', Validators.required],
      statut_id: ['']
    });
  }

  ngOnInit(): void {
    this.loadUrgences();
    this.loadContrats();
    
    this.demandeId = this.route.snapshot.paramMap.get('id');
    if (this.demandeId) {
      this.isEditMode = true;
      this.loadDemande();
    } else {
      // Définir le statut par défaut (EN_ATTENTE)
      this.setDefaultStatut();
    }
  }

  loadUrgences(): void {
    this.referenceDataService.getUrgences().subscribe(urgences => {
      this.urgences = urgences;
    });
  }

  loadContrats(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser && currentUser._id) {
      this.referenceDataService.getContratsByLocataire(currentUser._id).subscribe({
        next: (contrats) => {
          this.contrats = contrats;
        },
        error: (err) => {
          console.error('Erreur chargement contrats', err);
        }
      });
    }
  }

  loadDemande(): void {
    if (!this.demandeId) return;
    
    this.loading = true;
    this.maintenanceService.getDemandeById(this.demandeId).subscribe({
      next: (demande) => {
        this.demandeForm.patchValue({
          contrat_id: demande.contrat_id,
          description: demande.description,
          urgence_id: demande.urgence_id,
          statut_id: demande.statut_id
        });
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement demande', err);
        this.loading = false;
      }
    });
  }

  setDefaultStatut(): void {
    this.referenceDataService.getStatuts().subscribe(statuts => {
      const statutEnAttente = statuts.find(s => s.nom === 'EN_ATTENTE');
      if (statutEnAttente) {
        this.demandeForm.patchValue({ statut_id: statutEnAttente._id });
      }
    });
  }

  onSubmit(): void {
    if (this.demandeForm.invalid) {
      return;
    }

    this.loading = true;
    const demandeData = this.demandeForm.value;

    const request = this.isEditMode && this.demandeId
      ? this.maintenanceService.updateDemande(this.demandeId, demandeData)
      : this.maintenanceService.createDemande(demandeData);

    request.subscribe({
      next: () => {
        this.snackBar.open(
          this.isEditMode ? 'Demande modifiée avec succès' : 'Demande créée avec succès',
          'Fermer',
          { duration: 3000 }
        );
        this.router.navigate(['/maintenance']);
      },
      error: (err) => {
        console.error('Erreur sauvegarde demande', err);
        this.snackBar.open(
          'Erreur lors de la sauvegarde',
          'Fermer',
          { duration: 3000 }
        );
        this.loading = false;
      }
    });
  }

  annuler(): void {
    this.router.navigate(['/maintenance']);
  }
}