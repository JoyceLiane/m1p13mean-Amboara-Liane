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
  etages: string[] = [];

  // Panneau interactif
  etageActif: string = '';
  boutiquesEtageActif: any[] = [];
  showMagasins: boolean = true;

  selectedMagasin: any = null;
  tousLesProduits: any[] = [];
  filteredProduits: any[] = [];
  categoriesMagasin: any[] = [];

  selectedCategorie: string = '';
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
        this.mettreAJourCategories(data);
        this.cdr.detectChanges();
      },
      error: err => console.error('Erreur chargement produits actifs:', err)
    });

    this.contratService.getContratsActifs().subscribe({
      next: data => {
        this.contrats = Array.isArray(data) ? data : [];
        this.organiserParEtage();
        if (this.etages.length > 0) {
          this.selectionnerEtage(this.etages[0]);
        }
        this.cdr.detectChanges();
      },
      error: err => console.error('Erreur chargement contrats:', err)
    });

    this.panierService.panier$.subscribe(() => {
      this.nombreItemsPanier = this.panierService.getNombreItems();
      this.cdr.detectChanges();
    });
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

  selectionnerEtage(etage: string) {
    this.etageActif = etage;
    this.boutiquesEtageActif = this.contratsParEtage[etage] || [];
    this.cdr.detectChanges();
  }

  selectMagasin(contrat: any) {
    this.selectedMagasin = contrat;
    this.selectedCategorie = '';
    this.searchTerm = '';
    this.appliquerFiltres();
    setTimeout(() => {
      document.querySelector('.produits-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }

  reinitialiserMagasin() {
    this.selectedMagasin = null;
    this.selectedCategorie = '';
    this.searchTerm = '';
    this.appliquerFiltres();
  }

  toggleMagasins() {
    this.showMagasins = !this.showMagasins;
  }

  searchProduitsGlobaux() {
    this.selectedMagasin = null;
    this.appliquerFiltres();
  }

  filterByCategorie() {
    this.appliquerFiltres();
  }

  private appliquerFiltres() {
    let produits = [...this.tousLesProduits];

    // ✅ id_vendeur._id du produit = _id du contrat sélectionné
    if (this.selectedMagasin) {
      produits = produits.filter(p => p.id_vendeur?._id === this.selectedMagasin._id);
    }

    if (this.searchTerm?.trim()) {
      const terme = this.searchTerm.toLowerCase();
      produits = produits.filter(p =>
        p.nom?.toLowerCase().includes(terme) ||
        p.description?.toLowerCase().includes(terme)
      );
    }

    if (this.selectedCategorie) {
      produits = produits.filter(p => p.id_categorie?._id === this.selectedCategorie);
    }

    this.filteredProduits = produits;
    this.mettreAJourCategories(
      this.selectedMagasin
        ? this.tousLesProduits.filter(p => p.id_vendeur?._id === this.selectedMagasin._id)
        : this.tousLesProduits
    );
    this.cdr.detectChanges();
  }

  private mettreAJourCategories(produits: any[]) {
    const uniqueCategories = new Map();
    produits.forEach((p: any) => {
      if (p.id_categorie) {
        uniqueCategories.set(p.id_categorie._id, p.id_categorie);
      }
    });
    this.categoriesMagasin = Array.from(uniqueCategories.values());
  }

  ajouterAuPanier(produit: any, event: Event) {
    event.stopPropagation();
    if (produit.stock <= 0) { alert('Produit en rupture de stock'); return; }
    const vendeur = produit.id_vendeur;
    const magasinNom = vendeur?.nom_magasin || 'Magasin inconnu';
    const magasinId = vendeur?._id || null;
    this.panierService.ajouterAuPanier(produit, magasinNom, magasinId, 1);
    alert(`${produit.nom} ajouté au panier !`);
  }

  voirPanier() { this.router.navigate(['/panier']); }

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