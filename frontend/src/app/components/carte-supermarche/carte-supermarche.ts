import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ContratService } from '../../services/contrat';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
@Component({
  selector: 'app-carte-supermarche',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carte-supermarche.html',
  styleUrls: ['./carte-supermarche.css']
})
export class CarteSupermarcheComponent implements OnInit {

  contrats: any[] = [];
  contratsParEtage: { [etage: number]: any[] } = {};
  etages: number[] = []; 

  constructor(
    private contratService: ContratService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit() {
    this.contratService.getContrats().subscribe({
      next: data => {
        console.log('Contrats reçus :', data);
        this.contrats = Array.isArray(data) ? data : [];
        this.organiserParEtage();
        console.log('Contrats par étage :', this.contratsParEtage);
        console.log('Étages :', this.etages);
        this.cdr.detectChanges();
      },
      error: err => console.error('Erreur lors du chargement des contrats:', err)
    });
  }
  goToProduits(contrat: any) {
    this.router.navigate(['/magasin', contrat.id_magasin._id, 'produits']);
  }
  organiserParEtage() {
    this.contratsParEtage = {};
    this.contrats.forEach(contrat => {
      const etage = contrat.id_magasin?.etage || 0;
      if (!this.contratsParEtage[etage]) {
        this.contratsParEtage[etage] = [];
      }
      this.contratsParEtage[etage].push(contrat);
    });
  
    this.etages = Object.keys(this.contratsParEtage)
                        .map(key => parseInt(key))
                        .sort((a, b) => a - b);
  }

  getStatutColor(contrat: any) {
    const nom = contrat.status_id?.nom || 'inconnu';
    switch(nom.toLowerCase()) {
      case 'actif': return '#a0e7a0';
      case 'resilie': return '#f7c59f';
      case 'expulse': return '#f08080';
      case 'en_attente_renouvellement': return '#ffe680';
      default: return '#ddd';
    }
  }
}