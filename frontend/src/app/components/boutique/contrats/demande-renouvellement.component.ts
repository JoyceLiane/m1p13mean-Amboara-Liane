import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ContratService, Contrat } from '../../../services/contrat.service';
import { lastValueFrom } from 'rxjs';
import { DatePipe, NgIf, NgFor } from '@angular/common'; // Ajouter les imports

@Component({
  selector: 'app-demande-renouvellement',
  standalone: true, // Si c'est un composant standalone
  imports: [DatePipe, NgIf], // Ajouter DatePipe et NgIf dans imports
  templateUrl: './demande-renouvellement.component.html',
  styleUrls: ['./demande-renouvellement.component.css']
})
export class DemandeRenouvellementComponent implements OnInit {
  contrat: Contrat | null = null;
  envoiEnCours = false;
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
    }
  }

  async chargerContrat() {
    try {
      const contrat = await lastValueFrom(this.contratService.getContratById(this.contratId));
      this.contrat = contrat || null;
      
      if (!this.contrat) {
        alert('Contrat non trouvé');
        this.retour();
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Impossible de charger le contrat');
      this.retour();
    }
  }

  joursRestants(dateFin: Date | null | undefined): number {
    if (!dateFin) return 0;
    return this.contratService.calculerJoursRestants(dateFin);
  }

  estUrgent(dateFin: Date | null | undefined): boolean {
    if (!dateFin) return false;
    const jours = this.joursRestants(dateFin);
    return jours > 0 && jours <= 30;
  }

  async confirmer() {
    if (!this.contrat?._id || this.envoiEnCours) return;

    try {
      this.envoiEnCours = true;
      await lastValueFrom(this.contratService.demanderRenouvellement(this.contrat._id));
      alert('Demande envoyée avec succès');
      this.router.navigate(['/mes-contrats']);
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'envoi');
      this.envoiEnCours = false;
    }
  }

  retour() {
    this.router.navigate(['/mes-contrats']);
  }
}