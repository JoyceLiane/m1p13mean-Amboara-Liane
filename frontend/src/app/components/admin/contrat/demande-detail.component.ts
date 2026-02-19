import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { ContratService, Contrat } from '../../../services/contrat.service';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-demande-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DatePipe
  ],
  templateUrl: './demande-detail.component.html',
  styleUrls: ['./demande-detail.component.css']
})
export class DemandeDetailComponent implements OnInit {
  loading = true;
  traitementEnCours = false;
  demande: Contrat | null = null;
  modalApprobationOuvert = false;
  
  // Formulaire
  approbationForm: FormGroup;
  dateMin: string = new Date().toISOString().split('T')[0];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private contratService: ContratService,
    private fb: FormBuilder
  ) {
    this.approbationForm = this.fb.group({
      date_debut: ['', Validators.required],
      date_fin: ['', Validators.required]
    }, { validators: this.validateurDates });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.chargerDemande(id);
    }
  }

  validateurDates(group: FormGroup): { [key: string]: boolean } | null {
    const debut = group.get('date_debut')?.value;
    const fin = group.get('date_fin')?.value;
    
    if (debut && fin && new Date(fin) <= new Date(debut)) {
      return { datesInvalides: true };
    }
    return null;
  }

  async chargerDemande(id: string) {
    try {
      this.loading = true;
      this.demande = await lastValueFrom(this.contratService.getContratById(id));
    } catch (error) {
      console.error('Erreur chargement:', error);
      alert('Impossible de charger la demande');
      this.retour();
    } finally {
      this.loading = false;
    }
  }

  joursRestants(dateFin?: Date): number {
    return this.contratService.calculerJoursRestants(dateFin);
  }

  ouvrirModalApprobation() {
    this.modalApprobationOuvert = true;
    this.approbationForm.reset();
  }

  fermerModalApprobation() {
    this.modalApprobationOuvert = false;
    this.approbationForm.reset();
  }

  get dureeMois(): number {
    const debut = this.approbationForm.get('date_debut')?.value;
    const fin = this.approbationForm.get('date_fin')?.value;
    
    if (!debut || !fin) return 0;
    
    const d1 = new Date(debut);
    const d2 = new Date(fin);
    const diff = d2.getTime() - d1.getTime();
    return Math.round(diff / (1000 * 3600 * 24 * 30));
  }

  async approuver() {
    if (this.approbationForm.invalid || !this.demande?._id) return;

    try {
      this.traitementEnCours = true;
      
      await lastValueFrom(this.contratService.approuverRenouvellement(
        this.demande._id,
        this.approbationForm.value
      ));
      
      alert('Demande approuvée avec succès');
      this.fermerModalApprobation();
      this.chargerDemande(this.demande._id); // Recharger
      
    } catch (error) {
      console.error('Erreur approbation:', error);
      alert('Erreur lors de l\'approbation');
    } finally {
      this.traitementEnCours = false;
    }
  }

  async refuser() {
    if (!this.demande?._id) return;


    try {
      this.traitementEnCours = true;
      
      await lastValueFrom(this.contratService.refuserRenouvellement(this.demande._id));
      
      alert('Demande refusée');
      this.chargerDemande(this.demande._id); // Recharger
      
    } catch (error) {
      console.error('Erreur refus:', error);
      alert('Erreur lors du refus');
    } finally {
      this.traitementEnCours = false;
    }
  }

  retour() {
    this.router.navigate(['/demandes-renouvellement']);
  }
}