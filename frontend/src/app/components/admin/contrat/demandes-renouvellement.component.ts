import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms'; // Ajouter FormsModule et ReactiveFormsModule
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common'; // Ajouter CommonModule
import { ContratService, Contrat } from '../../../services/contrat.service';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-demandes-renouvellement',
  standalone: true, // Important : indique que c'est un composant standalone
  imports: [
    CommonModule,           // Pour ngIf, ngFor, date pipe, number pipe
    FormsModule,            // Pour ngModel
    ReactiveFormsModule,    // Pour formGroup, formControl
    DatePipe,               // Pour le pipe date
    DecimalPipe             // Pour le pipe number
  ],
  templateUrl: './demandes-renouvellement.component.html',
  styleUrls: ['./demandes-renouvellement.component.css']
})
export class DemandesRenouvellementComponent implements OnInit {
  loading = true;
  traitementEnCours = false;
  demandes: Contrat[] = [];
  demandeSelectionnee: Contrat | null = null;
  modalOuvert = false;
  
  // Filtres
  filtreActif: string = 'en-attente';
  recherche: string = '';
  filtreStatut: string = 'EN_ATTENTE';
  
  // Pagination
  pageActuelle: number = 1;
  totalPages: number = 1;
  itemsParPage: number = 10;
  totalDemandes: number = 0;
  
  // Stats
  stats = {
    enAttente: 0,
    approuvees: 0,
    refusees: 0,
    total: 0,
    ceMois: 0
  };
  
  // Formulaire
  traitementForm: FormGroup;
  dateMin: string = new Date().toISOString().split('T')[0];

  constructor(
    private contratService: ContratService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.traitementForm = this.fb.group({
      date_debut: ['', Validators.required],
      date_fin: ['', Validators.required]
    }, { validators: this.validateurDates });
  }

  ngOnInit() {
    this.chargerDemandes();
    this.chargerStats();
  }

  validateurDates(group: FormGroup): { [key: string]: boolean } | null {
    const debut = group.get('date_debut')?.value;
    const fin = group.get('date_fin')?.value;
    
    if (debut && fin && new Date(fin) <= new Date(debut)) {
      return { datesInvalides: true };
    }
    return null;
  }

  async chargerDemandes() {
    try {
      this.loading = true;
      
      const params: any = {
        page: this.pageActuelle,
        limit: this.itemsParPage
      };
      
      // Déterminer le statut à filtrer
      if (this.filtreActif !== 'toutes') {
        if (this.filtreActif === 'en-attente') params.statut = 'EN_ATTENTE';
        else if (this.filtreActif === 'approuvees') params.statut = 'APPROUVEE';
        else if (this.filtreActif === 'refusees') params.statut = 'REFUSEE';
      }
      
      if (this.recherche) {
        params.recherche = this.recherche;
      }
      
      const result = await lastValueFrom(this.contratService.getToutesDemandesRenouvellement(params));
      this.demandes = result.demandes;
      this.totalDemandes = result.total;
      this.totalPages = Math.ceil(result.total / this.itemsParPage);
      
    } catch (error) {
      console.error('Erreur chargement:', error);
      alert('Erreur lors du chargement des demandes');
    } finally {
      this.loading = false;
    }
  }

  async chargerStats() {
    try {
      this.stats = await lastValueFrom(this.contratService.getStatsRenouvellements());
    } catch (error) {
      console.error('Erreur stats:', error);
    }
  }

  setFiltre(filtre: string) {
    this.filtreActif = filtre;
    this.pageActuelle = 1;
    this.chargerDemandes();
  }

  changerFiltreStatut() {
    this.pageActuelle = 1;
    this.chargerDemandes();
  }

  rechercher() {
    this.pageActuelle = 1;
    this.chargerDemandes();
  }

  changerPage(page: number) {
    this.pageActuelle = page;
    this.chargerDemandes();
  }

  joursRestants(dateFin?: Date): number {
    return this.contratService.calculerJoursRestants(dateFin);
  }

  ouvrirModalTraitement(demande: Contrat) {
    this.demandeSelectionnee = demande;
    this.modalOuvert = true;
    this.traitementForm.reset();
  }

  fermerModal() {
    this.modalOuvert = false;
    this.demandeSelectionnee = null;
    this.traitementForm.reset();
  }

  get dureeMois(): number {
    const debut = this.traitementForm.get('date_debut')?.value;
    const fin = this.traitementForm.get('date_fin')?.value;
    
    if (!debut || !fin) return 0;
    
    const d1 = new Date(debut);
    const d2 = new Date(fin);
    const diff = d2.getTime() - d1.getTime();
    return Math.round(diff / (1000 * 3600 * 24 * 30));
  }

  async approuver() {
    if (this.traitementForm.invalid || !this.demandeSelectionnee?._id) return;

    try {
      this.traitementEnCours = true;
      
      await lastValueFrom(this.contratService.approuverRenouvellement(
        this.demandeSelectionnee._id,
        this.traitementForm.value
      ));
      
      alert('Demande approuvée avec succès');
      this.fermerModal();
      this.chargerDemandes();
      this.chargerStats();
      
    } catch (error) {
      console.error('Erreur approbation:', error);
      alert('Erreur lors de l\'approbation');
    } finally {
      this.traitementEnCours = false;
    }
  }

  async refuser() {
    if (!this.demandeSelectionnee?._id) return;


    try {
      this.traitementEnCours = true;
      
      await lastValueFrom(this.contratService.refuserRenouvellement(this.demandeSelectionnee._id));
      
      alert('Demande refusée');
      this.fermerModal();
      this.chargerDemandes();
      this.chargerStats();
      
    } catch (error) {
      console.error('Erreur refus:', error);
      alert('Erreur lors du refus');
    } finally {
      this.traitementEnCours = false;
    }
  }

  voirDetail(demandeId: string) {
    this.router.navigate(['/demandes-renouvellement', demandeId]);
  }
}