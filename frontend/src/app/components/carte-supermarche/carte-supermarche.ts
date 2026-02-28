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
  contratsParEtage: { [etage: string]: any[] } = {};
  etages: any[] = [];
  selectedMagasin: any = null;
  
  // Source unique de vérité
  tousLesProduits: any[] = [];
  filteredProduits: any[] = [];
  categoriesMagasin: any[] = [];
  
  selectedCategorie: string = '';
  selectedEtage: string = '';
  searchTerm: string = '';
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
    this.produitsService.getProduitsActifs().subscribe({
      next: (data) => {
        this.tousLesProduits = data;
        this.filteredProduits = data;
        this.cdr.detectChanges();
      },
      error: err => console.error('Erreur chargement produits actifs:', err)
    });

    this.contratService.getContratsActifs().subscribe({
      next: data => {
        this.contrats = Array.isArray(data) ? data : [];
        this.organiserParEtage();
        this.cdr.detectChanges();
      },
      error: err => console.error('Erreur lors du chargement des contrats actifs:', err)
    });

    this.panierService.panier$.subscribe(() => {
      this.nombreItemsPanier = this.panierService.getNombreItems();
      this.cdr.detectChanges();
    });
  }

  // ✅ Sélection d'un magasin : filtre local sur tousLesProduits
  selectMagasin(contrat: any) {
    this.selectedMagasin = contrat;
    this.selectedCategorie = '';
    this.searchTerm = '';
    this.appliquerFiltres();
  }

  // ✅ Recherche globale : filtre local sur tousLesProduits
  searchProduitsGlobaux() {
    this.selectedMagasin = null;
    this.selectedCategorie = '';
    this.appliquerFiltres();
  }

  // ✅ Filtre par catégorie : filtre local
  filterByCategorie() {
    this.appliquerFiltres();
  }

  // ✅ Filtre par étage : filtre local sur contrats
  filterByEtage() {
    if (!this.selectedEtage) {
      this.organiserParEtage();
    } else {
      const filtered = this.contrats.filter(
        c => c.id_magasin?.etage?.nom === this.selectedEtage
      );
      this.contratsParEtage = { [this.selectedEtage]: filtered };
      this.etages = [this.selectedEtage];
    }
    this.cdr.detectChanges();
  }

  // ✅ Méthode centrale qui applique tous les filtres actifs
  private appliquerFiltres() {
    let produits = [...this.tousLesProduits];

    // Filtre par magasin sélectionné
    if (this.selectedMagasin) {
      produits = produits.filter(
        p => p.id_vendeur?._id === this.selectedMagasin.id_vendeur?._id
      );
    }

    // Filtre par terme de recherche
    if (this.searchTerm?.trim()) {
      const terme = this.searchTerm.toLowerCase();
      produits = produits.filter(p =>
        p.nom.toLowerCase().includes(terme)
      );
    }

    // Filtre par catégorie
    if (this.selectedCategorie) {
      produits = produits.filter(
        p => p.id_categorie?._id === this.selectedCategorie
      );
    }

    this.filteredProduits = produits;

    // Recalculer les catégories disponibles selon le contexte actuel (magasin ou global)
    const base = this.selectedMagasin
      ? this.tousLesProduits.filter(p => p.id_vendeur?._id === this.selectedMagasin.id_vendeur?._id)
      : this.tousLesProduits;

    const uniqueCategories = new Map();
    base.forEach((p: any) => {
      if (p.id_categorie) {
        uniqueCategories.set(p.id_categorie._id, p.id_categorie);
      }
    });
    this.categoriesMagasin = Array.from(uniqueCategories.values());

    this.cdr.detectChanges();
  }

  organiserParEtage() {
    this.contratsParEtage = {};
    this.contrats.forEach(contrat => {
      const etageNom = contrat.id_magasin?.etage?.nom || 'Inconnu';
      if (!this.contratsParEtage[etageNom]) {
        this.contratsParEtage[etageNom] = [];
      }
      this.contratsParEtage[etageNom].push(contrat);
    });
    this.etages = Object.keys(this.contratsParEtage);
  }

  ajouterAuPanier(produit: any, event: Event) {
    event.stopPropagation();

    if (produit.stock <= 0) {
      alert('Produit en rupture de stock');
      return;
    }

    const vendeur = produit.id_vendeur;
    const magasinNom = vendeur?.nom_magasin || 'Magasin inconnu';
    const magasinId = vendeur?._id || null;

    this.panierService.ajouterAuPanier(produit, magasinNom, magasinId, 1);
    alert(`${produit.nom} ajouté au panier !`);
  }

  voirPanier() {
    this.router.navigate(['/panier']);
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