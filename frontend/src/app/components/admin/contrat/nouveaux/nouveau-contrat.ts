import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { ContratService, Contrat } from '../../../../services/contrat.service';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-nouveau-contrat',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, DatePipe],
  templateUrl: './nouveau-contrat.html',
  styleUrls: ['./nouveau-contrat.css']
})
export class NouveauContratComponent implements OnInit {
  loading = true;
  traitementEnCours = false;
  demandes: Contrat[] = [];
  demandeSelectionnee: Contrat | null = null;

  modalOuvert = false;
  modalDetailOuvert = false;   
  recherche: string = '';

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
        // ✅ Pas de statut_demande → backend renvoie EN_ATTENTE par défaut
      };

      if (this.recherche) params.recherche = this.recherche;

      const result = await lastValueFrom(
        this.contratService.getDemandesNouveauContrat(params)
      );
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
      this.stats = await lastValueFrom(
        this.contratService.getStatsNouveauxContrats()
      );
    } catch (error) {
      console.error('Erreur stats:', error);
    }
  }

  rechercher() {
    this.pageActuelle = 1;
    this.chargerDemandes();
  }

  changerPage(page: number) {
    this.pageActuelle = page;
    this.chargerDemandes();
  }

  // ✅ Ouvrir modal détail (lecture seule)
  ouvrirDetail(demande: Contrat) {
    this.demandeSelectionnee = demande;
    this.modalDetailOuvert = true;
  }

  fermerDetail() {
    this.modalDetailOuvert = false;
    this.demandeSelectionnee = null;
  }

  // ✅ Ouvrir modal traitement (approuver/refuser)
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
    const diff = new Date(fin).getTime() - new Date(debut).getTime();
    return Math.round(diff / (1000 * 3600 * 24 * 30));
  }

  async approuver() {
    if (this.traitementForm.invalid || !this.demandeSelectionnee?._id) return;
    try {
      this.traitementEnCours = true;
      await lastValueFrom(
        this.contratService.approuverNouveauContrat(
          this.demandeSelectionnee._id,
          this.traitementForm.value
        )
      );
      alert(`✅ Contrat approuvé !\nLe compte de ${this.demandeSelectionnee.locataire_id?.nom} a été promu au rôle Boutique.`);
      this.fermerModal();
      this.chargerDemandes();
      this.chargerStats();
    } catch (error) {
      console.error('Erreur approbation:', error);
      alert("Erreur lors de l'approbation");
    } finally {
      this.traitementEnCours = false;
    }
  }
  traiterDepuisDetail() {
    const demande = this.demandeSelectionnee; 
    this.modalDetailOuvert = false;           
    if (demande) {
      this.ouvrirModalTraitement(demande);   
    }
  }
  async refuser() {
    if (!this.demandeSelectionnee?._id) return;
    try {
      this.traitementEnCours = true;
      await lastValueFrom(
        this.contratService.refuserNouveauContrat(this.demandeSelectionnee._id)
      );
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
}