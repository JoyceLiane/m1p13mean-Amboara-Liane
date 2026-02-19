import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ContratService, Contrat } from '../../../services/contrat.service';
import { AuthService } from '../../../services/auth';
import { lastValueFrom } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mes-contrats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mes-contrats.component.html',
  styleUrls: ['./mes-contrats.component.css']
})
export class MesContratsComponent implements OnInit {
  loading = true;
  renouvellementEnCours = false;
  contrats: Contrat[] = [];
  demandesEnCours: Set<string> = new Set();
  userId: string = '';

  constructor(
    private contratService: ContratService,
    private authService: AuthService,
    private router: Router
  ) {
    const currentUser = this.authService.getCurrentUser();
    this.userId = currentUser?._id || '';
  }

  ngOnInit() {
    if (!this.userId) {
      console.error('Utilisateur non connecté');
      this.loading = false;
      return;
    }
    
    this.chargerContrats();
    this.chargerDemandesEnCours();
  }

  async chargerContrats() {
    try {
      this.loading = true;
      const contrats = await lastValueFrom(this.contratService.getContratsByLocataire(this.userId));
      
      if (contrats) {
        this.contrats = contrats.sort((a, b) => {
          const dateA = a.date_fin ? new Date(a.date_fin).getTime() : 0;
          const dateB = b.date_fin ? new Date(b.date_fin).getTime() : 0;
          return dateA - dateB;
        });
      } else {
        this.contrats = [];
      }
      
    } catch (error) {
      console.error('Erreur chargement contrats:', error);
      alert('Impossible de charger vos contrats');
    } finally {
      this.loading = false;
    }
  }

  async chargerDemandesEnCours() {
    try {
      const demandes = await lastValueFrom(this.contratService.getDemandesEnCours(this.userId));
      
      if (demandes) {
        const ids = demandes
          .map(d => d.contrat_parent_id?._id)
          .filter((id): id is string => id !== undefined && id !== null);
        
        this.demandesEnCours = new Set(ids);
      }
      
    } catch (error) {
      console.error('Erreur chargement demandes:', error);
    }
  }

  joursRestants(dateFin?: Date): number {
    if (!dateFin) return 0;
    const fin = new Date(dateFin).getTime();
    const maintenant = new Date().getTime();
    const diff = fin - maintenant;
    return Math.ceil(diff / (1000 * 3600 * 24));
  }

  estUrgent(dateFin?: Date): boolean {
    const jours = this.joursRestants(dateFin);
    return jours > 0 && jours <= 30;
  }

  estExpire(dateFin?: Date): boolean {
    return this.joursRestants(dateFin) <= 0;
  }

  progressionExpiration(dateFin?: Date): number {
    if (!dateFin) return 0;
    const fin = new Date(dateFin).getTime();
    const maintenant = new Date().getTime();
    
    if (maintenant >= fin) return 100;
    
    const dureeTotale = 365 * 24 * 60 * 60 * 1000;
    const debut = fin - dureeTotale;
    
    if (maintenant <= debut) return 0;
    
    const ecoule = maintenant - debut;
    return (ecoule / dureeTotale) * 100;
  }

  aDemandeEnCours(contratId: string): boolean {
    return this.demandesEnCours.has(contratId);
  }

  peutDemanderRenouvellement(contrat: Contrat): boolean {
    if (!contrat._id) return false;
    
    const jours = this.joursRestants(contrat.date_fin);
    return jours > 0 && 
           jours <= 30 && 
           !this.estExpire(contrat.date_fin) && 
           !this.aDemandeEnCours(contrat._id) &&
           !this.renouvellementEnCours;
  }

  async demanderRenouvellement(contrat: Contrat) {
    if (!contrat._id || this.renouvellementEnCours) return;

    const confirm = window.confirm(
      `Demande de renouvellement\n\nVoulez-vous demander le renouvellement du contrat pour ${contrat.nom_magasin} ? Votre demande sera traitée par notre équipe.`
    );

    if (!confirm) return;

    try {
      this.renouvellementEnCours = true;
      await lastValueFrom(this.contratService.demanderRenouvellement(contrat._id));
      alert('Demande envoyée avec succès\n\nVotre demande de renouvellement a bien été prise en compte');
      await this.chargerDemandesEnCours();
    } catch (error) {
      console.error('Erreur demande renouvellement:', error);
      alert('Erreur lors de la demande');
    } finally {
      this.renouvellementEnCours = false;
    }
  }

  voirDetails(contratId: string) {
    this.router.navigate(['/mes-contrats', contratId]);
  }
}