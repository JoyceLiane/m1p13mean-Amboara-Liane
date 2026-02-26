import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule, DecimalPipe, DatePipe } from '@angular/common';
import { PaiementService } from '../../../services/paiement.service';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-paiement-detail',
  standalone: true,
  imports: [
    CommonModule // Pour ngIf, ngFor, date pipe
  ],
  providers: [
    DecimalPipe, // Pour le formatage des nombres
    DatePipe // Pour le formatage des dates
  ],
  templateUrl: './paiement-detail.component.html',
  styleUrls: ['./paiement-detail.component.css']
})
export class PaiementDetailComponent implements OnInit {
  paiement: any = null;
  loading = false;
  isAdmin = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private paiementService: PaiementService,
    private authService: AuthService,
    private decimalPipe: DecimalPipe, // Injection du pipe
    private datePipe: DatePipe // Injection du pipe date
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
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
        console.error('Erreur lors du chargement du paiement', error);
        this.loading = false;
        // Rediriger vers la liste en cas d'erreur
        this.retour();
      }
    });
  }

  // Méthode pour formater les nombres
  formatNumber(value: number): string {
    if (value === null || value === undefined) return '';
    return this.decimalPipe.transform(value, '1.0-0') || value.toString();
  }

  // Méthode pour formater les dates
  formatDate(date: Date | string, format: string = 'dd/MM/yyyy'): string {
    if (!date) return '';
    return this.datePipe.transform(date, format) || '';
  }

  getContratInfo(): any {
    if (!this.paiement || typeof this.paiement.contrat_id === 'string') {
      return null;
    }
    return this.paiement.contrat_id;
  }

  getLocataireInfo(): any {
    const contrat = this.getContratInfo();
    return contrat?.locataire_id || null;
  }

  getMagasinInfo(): any {
    const contrat = this.getContratInfo();
    return contrat?.id_magasin || null;
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
      case 'validé':
        return '#e8f5e8';
      case 'en_attente':
        return '#fff3e0';
      case 'annulé':
        return '#ffebee';
      default:
        return '#f5f5f5';
    }
  }

  getStatutIcon(statut: string): string {
    switch(statut) {
      case 'validé':
        return 'mdi-check-circle';
      case 'en_attente':
        return 'mdi-clock-outline';
      case 'annulé':
        return 'mdi-cancel';
      default:
        return 'mdi-information';
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
            body {
              font-family: Arial, sans-serif;
              padding: 40px;
              max-width: 800px;
              margin: 0 auto;
            }
            .recu-card {
              background: white;
              border: 1px solid #ddd;
              padding: 30px;
              border-radius: 8px;
            }
            .recu-header {
              text-align: center;
              margin-bottom: 30px;
              padding-bottom: 20px;
              border-bottom: 2px solid #333;
            }
            .recu-title h1 {
              margin: 10px 0;
              font-size: 24px;
            }
            .recu-number, .recu-date {
              color: #666;
              margin: 5px 0;
            }
            .carte {
              margin-bottom: 20px;
              border: 1px solid #ddd;
              border-radius: 4px;
            }
            .carte-header {
              background: #f5f5f5;
              padding: 10px 15px;
              border-bottom: 1px solid #ddd;
            }
            .carte-body {
              padding: 15px;
            }
            .info-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 15px;
            }
            .info-item {
              margin-bottom: 10px;
            }
            .label {
              color: #666;
              font-size: 0.9em;
              display: block;
            }
            .value {
              font-weight: bold;
            }
            .detail-row {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              border-bottom: 1px solid #eee;
            }
            .detail-row.total {
              font-weight: bold;
              font-size: 1.1em;
              border-bottom: 2px solid #333;
              margin-top: 10px;
            }
            .recu-footer {
              margin-top: 40px;
              text-align: center;
              color: #666;
              font-size: 0.9em;
            }
            .signature {
              margin-top: 60px;
              text-align: right;
            }
            .mdi {
              margin-right: 5px;
            }
            @media print {
              body { padding: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="recu-card">
            ${contenuRecu}
          </div>
          <div style="text-align: center; margin-top: 20px;" class="no-print">
            <button onclick="window.print()">Imprimer</button>
            <button onclick="window.close()">Fermer</button>
          </div>
        </body>
      </html>
    `);

    fenetreImpression.document.close();
  }

  retour(): void {
    if (this.isAdmin) {
      this.router.navigate(['/paiements']);
    } else {
      this.router.navigate(['/locataire/paiements']);
    }
  }
}