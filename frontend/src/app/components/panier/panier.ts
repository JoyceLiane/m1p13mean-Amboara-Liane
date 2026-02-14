import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PanierService, PanierItem } from '../../services/panier';
import { MouvementStockService, MouvementStockCreate } from '../../services/mouvement-stockcreate';
import { TypeMouvementService } from '../../services/type-mouvement';
import { AuthService } from '../../services/auth';
import { UrlHelper } from '../../services/url.helper';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-panier',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './panier.html',
  styleUrls: ['./panier.css']
})
export class PanierComponent implements OnInit {
  panierItems: PanierItem[] = [];
  total: number = 0;
  isProcessing: boolean = false;
  typeMouvementVenteId: string = '';

  constructor(
    public panierService: PanierService,
    private mouvementStockService: MouvementStockService,
    private typeMouvementService: TypeMouvementService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    public urlHelper: UrlHelper
  ) {}

  ngOnInit() {
    this.loadPanier();
    this.loadTypeMouvementVente();
  }

  loadPanier() {
    this.panierService.panier$.subscribe(items => {
      this.panierItems = items;
      this.total = this.panierService.getTotal();
      this.cdr.detectChanges();
    });
  }

  loadTypeMouvementVente() {
    this.typeMouvementService.getTypeByNom('vente').subscribe({
      next: (type) => {
        this.typeMouvementVenteId = type._id;
        // console.log('Type mouvement vente chargé:', this.typeMouvementVenteId);
      },
      error: (err) => {
        console.error('Erreur chargement type mouvement:', err);
        alert('Erreur: impossible de charger le type de mouvement. Assurez-vous que le type "vente" existe en base.');
      }
    });
  }

  augmenterQuantite(produitId: string) {
    const item = this.panierItems.find(i => i.produit._id === produitId);
    if (item) {
      // Vérifier le stock disponible
      if (item.quantite >= item.produit.stock) {
        alert(`Stock insuffisant. Stock disponible: ${item.produit.stock}`);
        return;
      }
      this.panierService.modifierQuantite(produitId, item.quantite + 1);
    }
  }

  diminuerQuantite(produitId: string) {
    const item = this.panierItems.find(i => i.produit._id === produitId);
    if (item && item.quantite > 1) {
      this.panierService.modifierQuantite(produitId, item.quantite - 1);
    }
  }

  retirerProduit(produitId: string) {
    if (confirm('Voulez-vous retirer ce produit du panier ?')) {
      this.panierService.retirerDuPanier(produitId);
    }
  }

  viderPanier() {
    if (confirm('Voulez-vous vider tout le panier ?')) {
      this.panierService.viderPanier();
    }
  }

  continuerAchats() {
    this.router.navigate(['/client-dashboard']);
  }

  async validerCommande() {
    if (this.panierItems.length === 0) {
      alert('Votre panier est vide');
      return;
    }
  
    if (!this.typeMouvementVenteId) {
      alert('Erreur: type de mouvement non chargé. Veuillez réessayer.');
      return;
    }
  
    // ✅ Utiliser la nouvelle méthode getUserId()
    const userId = this.authService.getUserId();
    
    if (!userId) {
      alert('Erreur: utilisateur non connecté');
      console.error('Impossible de récupérer l\'ID utilisateur');
      return;
    }
  
    // Vérifier les stocks
    for (const item of this.panierItems) {
      if (item.quantite > item.produit.stock) {
        alert(`Stock insuffisant pour ${item.produit.nom}. Stock disponible: ${item.produit.stock}`);
        return;
      }
    }
  
    if (!confirm(`Confirmer la commande de ${this.panierItems.length} produit(s) pour un total de ${this.total} Ar ?`)) {
      return;
    }
  
    this.isProcessing = true;
  
    try {
      const mouvements: MouvementStockCreate[] = this.panierItems.map(item => ({
        id: `MVT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        user_id: userId, // ✅ Déjà un string
        produits_id: item.produit._id,
        qt_entree: 0,
        qt_sortie: item.quantite,
        date_mouvement: new Date(),
        id_type: this.typeMouvementVenteId
      }));
  
      console.log('Mouvements à créer:', mouvements);
  
      this.mouvementStockService.createMouvementsBatch(mouvements).subscribe({
        next: (results) => {
          console.log('Mouvements créés avec succès:', results);
          
          this.panierService.viderPanier();
          
          alert('Commande validée avec succès ! Les stocks ont été mis à jour.');
          
          this.isProcessing = false;
          this.router.navigate(['/client-dashboard']);
        },
        error: (err) => {
          console.error('Erreur lors de la validation:', err);
          alert('Erreur lors de la validation de la commande. Veuillez réessayer.');
          this.isProcessing = false;
        }
      });
  
    } catch (error) {
      console.error('Erreur:', error);
      alert('Une erreur est survenue');
      this.isProcessing = false;
    }
  }

  retour() {
    this.router.navigate(['/client-dashboard']);
  }
}