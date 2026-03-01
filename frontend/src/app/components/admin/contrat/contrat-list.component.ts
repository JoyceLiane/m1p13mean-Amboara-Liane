import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms'; // Garder FormBuilder si nécessaire pour d'autres fonctionnalités
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { ContratService, Contrat } from '../../../services/contrat.service';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-contrat-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DatePipe
  ],
  templateUrl: './contrat-list.component.html',
  styleUrls: ['./contrat-list.component.css']
})
export class ContratListComponent implements OnInit {
  loading = true;
  contrats: Contrat[] = [];
  
  // Filtres
  recherche: string = '';
  filtreStatut: string = 'tous';
  
  // Pagination
  pageActuelle: number = 1;
  totalPages: number = 1;
  itemsParPage: number = 10;
  totalContrats: number = 0;
  
  // Stats
  stats = {
    actifs: 0,
    expirant: 0,
    termines: 0,
    total: 0
  };

  constructor(
    private contratService: ContratService,
    private router: Router,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.chargerContrats();
    this.calculerStats();
  }

  async chargerContrats() {
    try {
      this.loading = true;
      
      // Récupérer tous les contrats
      const contrats = await lastValueFrom(this.contratService.getAllContrats());
      
      // Appliquer les filtres
      this.contrats = this.filtrerContrats(contrats);
      
      // Calculer la pagination
      this.totalContrats = this.contrats.length;
      this.totalPages = Math.ceil(this.totalContrats / this.itemsParPage);
      
      // Appliquer la pagination
      const debut = (this.pageActuelle - 1) * this.itemsParPage;
      const fin = debut + this.itemsParPage;
      this.contrats = this.contrats.slice(debut, fin);
      
    } catch (error) {
      console.error('Erreur chargement des contrats:', error);
      alert('Erreur lors du chargement des contrats');
    } finally {
      this.loading = false;
    }
  }

  filtrerContrats(contrats: Contrat[]): Contrat[] {
    return contrats.filter(contrat => {
      let correspond = true;
      
      // Filtre par recherche (magasin ou locataire)
      if (this.recherche) {
        const rechercheLower = this.recherche.toLowerCase();
        const magasinNom = contrat.id_magasin?.nom?.toLowerCase() || '';
        const locataireNom = contrat.locataire_id?.nom?.toLowerCase() || '';
        const locataireEmail = contrat.locataire_id?.email?.toLowerCase() || '';
        
        correspond = magasinNom.includes(rechercheLower) || 
                    locataireNom.includes(rechercheLower) ||
                    locataireEmail.includes(rechercheLower);
      }
      
      // Filtre par statut
      if (correspond && this.filtreStatut !== 'tous') {
        const joursRestants = this.calculerJoursRestants(contrat.date_fin);
        
        if (this.filtreStatut === 'actif') {
          correspond = joursRestants > 30;
        } else if (this.filtreStatut === 'expirant') {
          correspond = joursRestants > 0 && joursRestants <= 30;
        } else if (this.filtreStatut === 'termine') {
          correspond = joursRestants <= 0;
        }
      }
      
      return correspond;
    });
  }

  calculerStats() {
    if (!this.contrats.length) return;
    
    this.contratService.getAllContrats().subscribe(contrats => {
      this.stats.total = contrats.length;
      this.stats.actifs = contrats.filter(c => this.calculerJoursRestants(c.date_fin) > 30).length;
      this.stats.expirant = contrats.filter(c => {
        const jours = this.calculerJoursRestants(c.date_fin);
        return jours > 0 && jours <= 30;
      }).length;
      this.stats.termines = contrats.filter(c => this.calculerJoursRestants(c.date_fin) <= 0).length;
    });
  }

  calculerJoursRestants(dateFin?: Date): number {
    if (!dateFin) return 0;
    
    const aujourdhui = new Date();
    const fin = new Date(dateFin);
    const diff = fin.getTime() - aujourdhui.getTime();
    return Math.ceil(diff / (1000 * 3600 * 24));
  }

  async rechercher() {
    this.pageActuelle = 1;
    await this.chargerContrats();
  }

  async changerFiltreStatut() {
    this.pageActuelle = 1;
    await this.chargerContrats();
  }

  changerPage(page: number) {
    this.pageActuelle = page;
    this.chargerContrats();
  }

  getStatutContrat(dateFin?: Date): { label: string; classe: string } {
    const joursRestants = this.calculerJoursRestants(dateFin);
    
    if (joursRestants <= 0) {
      return { label: 'Terminé', classe: 'statut-termine' };
    } else if (joursRestants <= 30) {
      return { label: 'Expire bientôt', classe: 'statut-expirant' };
    } else {
      return { label: 'Actif', classe: 'statut-actif' };
    }
  }

  getEtageMagasin(contrat: Contrat): string {
  return contrat.id_magasin?.etage?.toString() || 'Non défini';
}

  voirDetail(contratId: string) {
    this.router.navigate(['/contrats', contratId]);
  }

  voirDemandesRenouvellement() {
    this.router.navigate(['/demandes-renouvellement']);
  }

  getDateDebut(contrat: Contrat): Date | null {
    return contrat.date_debut || null;
  }

  getDateFin(contrat: Contrat): Date | null {
    return contrat.date_fin || null;
  }

  getMontantLoyer(contrat: Contrat): number {
    return (contrat.id_magasin?.superficie || 0) * (contrat.id_magasin?.prix_m2 || 0);
  }
}