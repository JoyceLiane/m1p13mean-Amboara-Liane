import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ContratService } from '../../services/contrat';
import { CommonModule } from '@angular/common';
import { ProduitsService } from '../../services/produits';
import { FormsModule } from '@angular/forms';
import { UrlHelper } from '../../services/url.helper';
@Component({
  selector: 'app-carte-supermarche',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './carte-supermarche.html',
  styleUrls: ['./carte-supermarche.css']
})
export class CarteSupermarcheComponent implements OnInit {

  contrats: any[] = [];
  contratsParEtage: { [etage: number]: any[] } = {};
  etages: number[] = [];
  selectedMagasin: any = null;
  produitsMagasin: any[] = [];
  filteredProduits: any[] = [];
  categoriesMagasin: any[] = [];
  selectedCategorie: string = '';

  constructor(
    private contratService: ContratService,
    private cdr: ChangeDetectorRef,
    private produitsService: ProduitsService,
    public urlHelper: UrlHelper
  ) { }

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
  selectMagasin(contrat: any) {
    console.log('Magasin sélectionné:', contrat);
    console.log('ID du contrat:', contrat._id);
    console.log('ID du magasin:', contrat.id_magasin?._id);

    this.selectedMagasin = contrat;

    this.loadProduitsMagasin(contrat._id);
  }
loadProduitsMagasin(contratId: string) {
    console.log('Chargement des produits pour contrat:', contratId);

    this.produitsService.getProduitsByContrat(contratId).subscribe({  // ← Changé !
      next: (data) => {
        // console.log('Produits reçus:', data);
        this.produitsMagasin = data;
        this.filteredProduits = data;

        const uniqueCategories = new Map();
        data.forEach((p: any) => {
          if (p.id_categorie) {
            uniqueCategories.set(p.id_categorie._id, p.id_categorie);
          }
        });

        this.categoriesMagasin = Array.from(uniqueCategories.values());
        this.cdr.detectChanges();
      },
      error: err => {
        console.error('Erreur chargement produits:', err);
      }
    });
  }

  filterByCategorie() {
    console.log('Filtre par catégorie:', this.selectedCategorie);

    if (!this.selectedCategorie) {
      this.filteredProduits = this.produitsMagasin;
    } else {
      this.filteredProduits = this.produitsMagasin.filter(
        p => p.id_categorie?._id === this.selectedCategorie
      );
    }

    console.log('Produits après filtre:', this.filteredProduits);
    this.cdr.detectChanges();
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
    switch (nom.toLowerCase()) {
      case 'actif': return '#a0e7a0';
      case 'resilie': return '#f7c59f';
      case 'expulse': return '#f08080';
      case 'en_attente_renouvellement': return '#ffe680';
      default: return '#ddd';
    }
  }
}