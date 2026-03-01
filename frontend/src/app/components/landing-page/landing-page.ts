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
export class LandingPage implements OnInit {

  contrats: any[] = [];
  contratsParEtage: { [etage: string]: any[] } = {};
  etages: string[] = [];

  // Étage actif dans le sélecteur interactif
  etageActif: string = '';
  // Boutiques affichées selon l'étage actif
  boutiquesEtageActif: any[] = [];

  selectedMagasin: any = null;
  tousLesProduits: any[] = [];
  filteredProduits: any[] = [];
  categoriesMagasin: any[] = [];

  selectedCategorie: string = '';
  searchTerm: string = '';
  nombreItemsPanier: number = 0;

  // Afficher/masquer la section magasins
  showMagasins: boolean = true;

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
        // Sélectionner le premier étage par défaut
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

  // Changer l'étage actif dans le panneau interactif
  selectionnerEtage(etage: string) {
    this.etageActif = etage;
    this.boutiquesEtageActif = this.contratsParEtage[etage] || [];
    this.cdr.detectChanges();
  }

  // Sélectionner un magasin → filtre les produits
  selectMagasin(contrat: any) {
    this.selectedMagasin = contrat;
    this.selectedCategorie = '';
    this.searchTerm = '';
    this.appliquerFiltres();

    // Scroll automatique vers les produits
    setTimeout(() => {
      document.querySelector('.produits-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }

  // Réinitialiser la sélection → afficher tous les produits
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

    // ✅ Filtre par magasin — id_vendeur._id du produit = _id du contrat sélectionné
    if (this.selectedMagasin) {
      produits = produits.filter(p =>
        p.id_vendeur?._id === this.selectedMagasin._id
      );
    }

    // Filtre par recherche
    if (this.searchTerm?.trim()) {
      const terme = this.searchTerm.toLowerCase();
      produits = produits.filter(p =>
        p.nom?.toLowerCase().includes(terme) ||
        p.description?.toLowerCase().includes(terme)
      );
    }

    // Filtre par catégorie
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

  goTologin() { this.router.navigate(['/login']); }
  goToregister() { this.router.navigate(['/register']); }
}