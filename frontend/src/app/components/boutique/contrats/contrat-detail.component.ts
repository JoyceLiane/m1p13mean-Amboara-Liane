import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ContratService, Contrat } from '../../../services/contrat.service';
import { lastValueFrom } from 'rxjs';
import { DatePipe, DecimalPipe, NgIf, NgFor } from '@angular/common'; // Ajouter DecimalPipe

@Component({
  selector: 'app-contrat-detail',
  standalone: true, // Si c'est un composant standalone
  imports: [DatePipe, DecimalPipe, NgIf, NgFor], // Ajouter DecimalPipe dans imports
  templateUrl: './contrat-detail.component.html',
  styleUrls: ['./contrat-detail.component.css']
})
export class ContratDetailComponent implements OnInit {
  loading = true;
  renouvellementEnCours = false;
  contrat: Contrat | null = null;
  historiqueRenouvellements: Contrat[] = [];
  contratId: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private contratService: ContratService
  ) {}

  ngOnInit() {
    this.contratId = this.route.snapshot.paramMap.get('id') || '';
    if (this.contratId) {
      this.chargerContrat();
      this.chargerHistorique();
    }
  }

  async chargerContrat() {
    try {
      this.loading = true;
      const contrat = await lastValueFrom(this.contratService.getContratById(this.contratId));
      this.contrat = contrat || null;
    } catch (error) {
      console.error('Erreur chargement contrat:', error);
      alert('Impossible de charger les détails du contrat');
    } finally {
      this.loading = false;
    }
  }

  async chargerHistorique() {
    try {
      const historique = await lastValueFrom(this.contratService.getHistoriqueRenouvellements(this.contratId));
      this.historiqueRenouvellements = historique || [];
    } catch (error) {
      console.error('Erreur chargement historique:', error);
      this.historiqueRenouvellements = [];
    }
  }

  joursRestants(dateFin?: Date): number {
    if (!dateFin) return 0;
    return this.contratService.calculerJoursRestants(dateFin);
  }

  estUrgent(dateFin?: Date): boolean {
    if (!dateFin) return false;
    return this.contratService.expireBientot(dateFin);
  }

  estExpire(dateFin?: Date): boolean {
    if (!dateFin) return false;
    return this.contratService.estExpire(dateFin);
  }

  progressionExpiration(dateFin?: Date): number {
    if (!this.contrat?.date_debut || !dateFin) return 0;
    return this.contratService.calculerProgression(this.contrat.date_debut, dateFin);
  }

  peutDemanderRenouvellement(): boolean {
    if (!this.contrat || !this.contrat._id) return false;
    
    const jours = this.joursRestants(this.contrat.date_fin);
    return jours > 0 && 
           jours <= 30 && 
           !this.estExpire(this.contrat.date_fin) && 
           !this.renouvellementEnCours;
  }

  async demanderRenouvellement() {
    if (!this.contrat?._id || this.renouvellementEnCours) return;

    const confirm = window.confirm(
      `Voulez-vous demander le renouvellement de ce contrat ?`
    );

    if (!confirm) return;

    try {
      this.renouvellementEnCours = true;
      await lastValueFrom(this.contratService.demanderRenouvellement(this.contrat._id));
      alert('Demande de renouvellement envoyée avec succès');
      this.chargerHistorique();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la demande');
    } finally {
      this.renouvellementEnCours = false;
    }
  }

  retour() {
    this.router.navigate(['/mes-contrats']);
  }
}