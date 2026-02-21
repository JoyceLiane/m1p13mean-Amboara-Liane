import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ContratService } from '../../services/contrat.service';
import { CommonModule } from '@angular/common';
import { ProduitsService } from '../../services/produits';
import { FormsModule } from '@angular/forms';
import { UrlHelper } from '../../services/url.helper';
import { PanierService } from '../../services/panier';
import { Router } from '@angular/router';

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
  nombreItemsPanier: number = 0;

  constructor(
    private contratService: ContratService,
    private cdr: ChangeDetectorRef,
    private produitsService: ProduitsService,
    public urlHelper: UrlHelper,
    public panierService: PanierService,
    private router: Router
  ) { }

  ngOnInit() {
    this.contratService.getContrats().subscribe({
      next: data => {
        this.contrats = Array.isArray(data) ? data : [];
        this.organiserParEtage();
        this.cdr.detectChanges();
      },
      error: err => console.error('Erreur lors du chargement des contrats:', err)
    });

    this.panierService.panier$.subscribe(items => {
      this.nombreItemsPanier = this.panierService.getNombreItems();
      this.cdr.detectChanges();
    });
  }

  selectMagasin(contrat: any) {
    this.selectedMagasin = contrat;
    this.loadProduitsMagasin(contrat._id);
  }

  loadProduitsMagasin(contratId: string) {
    this.produitsService.getProduitsByContrat(contratId).subscribe({
      next: (data) => {
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
      error: err => console.error('Erreur chargement produits:', err)
    });
  }

  filterByCategorie() {
    if (!this.selectedCategorie) {
      this.filteredProduits = this.produitsMagasin;
    } else {
      this.filteredProduits = this.produitsMagasin.filter(
        p => p.id_categorie?._id === this.selectedCategorie
      );
    }
    this.cdr.detectChanges();
  }

  ajouterAuPanier(produit: any, event: Event) {
    event.stopPropagation();
    
    if (!this.selectedMagasin) {
      alert('Erreur: magasin non sélectionné');
      return;
    }

    // Vérifier le stock
    if (produit.stock <= 0) {
      alert('Produit en rupture de stock');
      return;
    }

    this.panierService.ajouterAuPanier(
      produit, 
      this.selectedMagasin.nom_magasin,
      this.selectedMagasin._id,
      1
    );
    
    alert(`${produit.nom} ajouté au panier !`);
  }

  voirPanier() {
    this.router.navigate(['/panier']);
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