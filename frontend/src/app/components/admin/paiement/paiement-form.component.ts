import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule, DecimalPipe, DatePipe } from '@angular/common';
import { PaiementService } from '../../../services/paiement.service';
import { ContratService } from '../../../services/contrat.service';

@Component({
  selector: 'app-paiement-form',
  standalone: true, // Important : indique que c'est un composant standalone
  imports: [
    CommonModule, // Fournit ngIf, ngFor, date pipe, etc.
    ReactiveFormsModule, // Pour les formulaires réactifs
    FormsModule
  ],
  providers: [
    DecimalPipe, // Fournir DecimalPipe pour le pipe number
    DatePipe // Pour le pipe date
  ],
  templateUrl: './paiement-form.component.html',
  styleUrls: ['./paiement-form.component.css']
})
export class PaiementFormComponent implements OnInit {
  paiementForm: FormGroup;
  contrats: any[] = [];
  optionsPaiement: any[] = [];
  contratSelectionne: any = null;
  loyerMensuel: number = 0;
  prochainMois: Date | null = null;
  isEditMode = false;
  paiementId: string | null = null;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private paiementService: PaiementService,
    private contratService: ContratService,
    private router: Router,
    private route: ActivatedRoute,
    private decimalPipe: DecimalPipe // Injection du pipe
  ) {
    this.paiementForm = this.fb.group({
      contrat_id: ['', Validators.required],
      nombre_mois: [1, [Validators.required, Validators.min(1)]],
      montant_total: [{ value: 0, disabled: true }],
      date_paiement: [new Date().toISOString().split('T')[0], Validators.required],
      penalite: [0],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.loadContrats();
    
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.paiementId = id;
        this.loadPaiement(id);
      }
    });

    this.paiementForm.get('contrat_id')?.valueChanges.subscribe(contratId => {
      if (contratId) {
        this.loadOptionsPaiement(contratId);
      }
    });

    this.paiementForm.get('nombre_mois')?.valueChanges.subscribe(() => {
      this.updateMontantTotal();
    });
  }

  // Méthode pour formater les nombres (alternative si le pipe ne fonctionne pas)
  formatNumber(value: number): string {
    if (value === null || value === undefined) return '';
    return this.decimalPipe.transform(value, '1.0-0') || value.toString();
  }

  loadContrats(): void {
    this.contratService.getAllContrats().subscribe({
      next: (contrats) => {
        this.contrats = contrats;
      },
      error: (err) => {
        console.error('Erreur chargement contrats', err);
      }
    });
  }

  loadPaiement(id: string): void {
    this.paiementService.getPaiementById(id).subscribe({
      next: (paiement) => {
        const contratId = typeof paiement.contrat_id === 'string' ? paiement.contrat_id : paiement.contrat_id._id;
        this.paiementForm.patchValue({
          contrat_id: contratId,
          nombre_mois: paiement.nombre_mois,
          montant_total: paiement.montant,
          date_paiement: new Date(paiement.date_paiement).toISOString().split('T')[0],
          penalite: paiement.penalite || 0,
          notes: paiement.notes || ''
        });
      },
      error: (err) => {
        console.error('Erreur chargement paiement', err);
      }
    });
  }

  loadOptionsPaiement(contratId: string): void {
    this.paiementService.getOptionsPaiement(contratId).subscribe({
      next: (data) => {
        this.optionsPaiement = data.options;
        this.loyerMensuel = data.loyer_mensuel;
        this.prochainMois = new Date(data.prochain_mois);
        this.contratSelectionne = this.contrats.find(c => c._id === contratId) || null;
        this.updateMontantTotal();
      },
      error: (err) => {
        console.error('Erreur chargement options', err);
      }
    });
  }

  updateMontantTotal(): void {
    const nbMois = this.paiementForm.get('nombre_mois')?.value || 1;
    const montantTotal = nbMois * this.loyerMensuel;
    this.paiementForm.get('montant_total')?.setValue(montantTotal);
  }

  onContratChange(event: any): void {
    const contratId = event.target.value;
    if (contratId) {
      this.loadOptionsPaiement(contratId);
    }
  }

  onSubmit(): void {
    if (this.paiementForm.invalid) {
      Object.keys(this.paiementForm.controls).forEach(key => {
        this.paiementForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.loading = true;
    const formValue = this.paiementForm.getRawValue();

    const paiementData = {
      contrat_id: formValue.contrat_id,
      nombre_mois: formValue.nombre_mois,
      montant_total: formValue.montant_total,
      date_paiement: new Date(formValue.date_paiement),
      notes: formValue.notes || '',
      penalite: formValue.penalite || 0
    };

    const request = this.isEditMode && this.paiementId
      ? this.paiementService.updatePaiement(this.paiementId, paiementData)
      : this.paiementService.payerMultiMois(paiementData);

    request.subscribe({
      next: () => {
        this.retour();
      },
      error: (err) => {
        console.error('Erreur enregistrement', err);
        this.loading = false;
      }
    });
  }

  retour(): void {
    this.router.navigate(['/paiements']);
  }
}