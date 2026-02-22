import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ContratService } from '../../services/contrat.service';
import { CommonModule } from '@angular/common';
import { ProduitsService } from '../../services/produits';
import { FormsModule } from '@angular/forms';
import { UrlHelper } from '../../services/url.helper';
import { PanierService } from '../../services/panier';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing-page',
  imports: [CommonModule, FormsModule],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css',
})
export class LandingPage {
  contrats: any[] = [];
  contratsParEtage: { [etage: number]: any[] } = {};
  etages: any[] = [];
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
  searchTerm: string = '';
  produitsGlobaux: any[] = [];
  
  searchProduitsGlobaux() {
    if (!this.searchTerm || this.searchTerm.trim() === '') {
      this.produitsGlobaux = [];
      return;
    }
  
    this.produitsService.getAllProduits().subscribe({
      next: (data) => {
        this.produitsGlobaux = data.filter(p =>
          p.nom.toLowerCase().includes(this.searchTerm.toLowerCase())
        );
        this.filteredProduits = this.produitsGlobaux;
        this.cdr.detectChanges();
      },
      error: err => console.error('Erreur recherche produits globaux:', err)
    });
  }
  ngOnInit() {
    // ✅ Charger uniquement les produits des contrats actifs
    this.produitsService.getProduitsActifs().subscribe({
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
      error: err => console.error('Erreur chargement produits actifs:', err)
    });
  
    // Charger les contrats actifs pour la carte des magasins
    this.contratService.getContratsActifs().subscribe({
      next: data => {
        this.contrats = Array.isArray(data) ? data : [];
        this.organiserParEtage();
        this.cdr.detectChanges();
      },
      error: err => console.error('Erreur lors du chargement des contrats actifs:', err)
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
  OnInit() {
    this.contratService.getContratsActifs().subscribe({
      next: data => {
        this.contrats = Array.isArray(data) ? data : [];
        this.organiserParEtage();
        this.cdr.detectChanges();
      },
      error: err => console.error('Erreur lors du chargement des contrats actifs:', err)
    });
  
    this.panierService.panier$.subscribe(items => {
      this.nombreItemsPanier = this.panierService.getNombreItems();
      this.cdr.detectChanges();
    });
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

  ajouterAuPanier(produit: any, event: Event) {
    event.stopPropagation();
  
    // Vérifier le stock
    if (produit.stock <= 0) {
      alert('Produit en rupture de stock');
      return;
    }
  
    // ✅ Récupérer le contrat vendeur et son magasin
    const vendeur = produit.id_vendeur;
    const magasinNom = vendeur?.nom_magasin || 'Magasin inconnu';
    const magasinId = vendeur?._id || null;
  
    this.panierService.ajouterAuPanier(
      produit,
      magasinNom,
      magasinId,
      1
    );
  
    alert(`${produit.nom} ajouté au panier !`);
  }
  
  goTologin() {
    this.router.navigate(['/login']);
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
  // Nouveau filtre dynamique
  selectedEtage: string = '';

filterByEtage() {
  if (!this.selectedEtage) {
    this.organiserParEtage(); // tous les étages
  } else {
    const filtered = this.contrats.filter(
      c => c.id_magasin?.etage?.nom === this.selectedEtage
    );
    this.contratsParEtage = { [this.selectedEtage]: filtered };
  }
  this.cdr.detectChanges();
}
}
