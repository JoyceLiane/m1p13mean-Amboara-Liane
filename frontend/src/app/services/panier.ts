// src/app/services/panier.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface PanierItem {
  produit: any;
  quantite: number;
  magasinNom: string;
  contratId: string;
}

@Injectable({
  providedIn: 'root'
})
export class PanierService {
  private panierItems: PanierItem[] = [];
  private panierSubject = new BehaviorSubject<PanierItem[]>([]);
  
  panier$: Observable<PanierItem[]> = this.panierSubject.asObservable();

  constructor() {
    this.loadPanierFromStorage();
  }

  private loadPanierFromStorage() {
    const saved = localStorage.getItem('panier');
    if (saved) {
      this.panierItems = JSON.parse(saved);
      this.panierSubject.next(this.panierItems);
    }
  }

  private savePanierToStorage() {
    localStorage.setItem('panier', JSON.stringify(this.panierItems));
    this.panierSubject.next(this.panierItems);
  }

  ajouterAuPanier(produit: any, magasinNom: string, contratId: string, quantite: number = 1) {
    const existingItem = this.panierItems.find(item => item.produit._id === produit._id);
    
    if (existingItem) {
      existingItem.quantite += quantite;
    } else {
      this.panierItems.push({
        produit,
        quantite,
        magasinNom,
        contratId
      });
    }
    
    this.savePanierToStorage();
  }

  retirerDuPanier(produitId: string) {
    this.panierItems = this.panierItems.filter(item => item.produit._id !== produitId);
    this.savePanierToStorage();
  }

  modifierQuantite(produitId: string, quantite: number) {
    const item = this.panierItems.find(i => i.produit._id === produitId);
    if (item) {
      if (quantite <= 0) {
        this.retirerDuPanier(produitId);
      } else {
        item.quantite = quantite;
        this.savePanierToStorage();
      }
    }
  }

  viderPanier() {
    this.panierItems = [];
    this.savePanierToStorage();
  }

  getPanier(): PanierItem[] {
    return this.panierItems;
  }

  getNombreItems(): number {
    return this.panierItems.reduce((total, item) => total + item.quantite, 0);
  }

  getTotal(): number {
    return this.panierItems.reduce((total, item) => {
      return total + (item.produit.prix * item.quantite);
    }, 0);
  }
}