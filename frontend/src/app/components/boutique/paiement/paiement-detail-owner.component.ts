import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PaiementService } from '../../../services/paiement.service';

@Component({
  selector: 'app-paiement-detail-owner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './paiement-detail-owner.component.html',
  styleUrls: ['./paiement-detail-owner.component.css']
})
export class PaiementDetailOwnerComponent implements OnInit {
  paiement: any = null;
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private paiementService: PaiementService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadPaiement(id);
    }
  }

  loadPaiement(id: string): void {
    this.loading = true;
    this.paiementService.getPaiementById(id).subscribe({
      next: (data) => {
        this.paiement = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur chargement paiement', error);
        this.loading = false;
        this.retour();
      }
    });
  }

  formatNumber(value: number): string {
    if (value === null || value === undefined) return '0';
    return new Intl.NumberFormat('fr-FR').format(value);
  }

  formatDate(date: Date | string, format: string = 'dd/MM/yyyy'): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getContratInfo(): any {
    if (!this.paiement || typeof this.paiement.contrat_id === 'string') {
      return null;
    }
    return this.paiement.contrat_id;
  }

  getLocataireInfo(): any {
    return this.getContratInfo()?.locataire_id || null;
  }

  getMagasinInfo(): any {
    return this.getContratInfo()?.id_magasin || null;
  }

  getMoisConcerne(): string {
    if (!this.paiement) return '';
    
    const debut = new Date(this.paiement.mois_concerne_debut);
    const fin = new Date(this.paiement.mois_concerne_fin);
    
    if (this.paiement.nombre_mois === 1) {
      return debut.toLocaleDateString('fr-FR', { 
        month: 'long', 
        year: 'numeric' 
      });
    } else {
      return `Du ${debut.toLocaleDateString('fr-FR', { 
        month: 'long', 
        year: 'numeric' 
      })} au ${fin.toLocaleDateString('fr-FR', { 
        month: 'long', 
        year: 'numeric' 
      })}`;
    }
  }

  getStatutColor(statut: string): string {
    switch(statut) {
      case 'validé': return '#e8f5e8';
      case 'en_attente': return '#fff3e0';
      case 'annulé': return '#ffebee';
      default: return '#f5f5f5';
    }
  }

  getStatutIcon(statut: string): string {
    switch(statut) {
      case 'validé': return 'mdi-check-circle';
      case 'en_attente': return 'mdi-clock-outline';
      case 'annulé': return 'mdi-cancel';
      default: return 'mdi-information';
    }
  }

  imprimerRecu(): void {
    const contenuRecu = document.getElementById('recu-paiement')?.innerHTML;
    if (!contenuRecu) return;

    const fenetreImpression = window.open('', '_blank');
    if (!fenetreImpression) return;

    fenetreImpression.document.write(`
      <html>
        <head>
          <title>Reçu de paiement</title>
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@mdi/font@7.4.47/css/materialdesignicons.min.css">
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; }
            .recu-card { max-width: 800px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 30px; }
            .info-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 20px; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="recu-card">
            ${contenuRecu}
          </div>
        </body>
      </html>
    `);

    fenetreImpression.document.close();
    setTimeout(() => fenetreImpression.print(), 500);
  }

  retour(): void {
    this.router.navigate(['/paiements']);
  }
}