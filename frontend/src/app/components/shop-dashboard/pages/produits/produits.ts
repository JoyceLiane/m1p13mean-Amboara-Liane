import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../services/auth';
import { ProduitsService } from '../../../../services/produits';
import { ContratService } from '../../../../services/contrat';
import { Produit, Categorie } from '../../../../models/produit';

@Component({
  selector: 'app-produits-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './produits.html',
  styleUrl: './produits.css',
})
export class ProduitsPageComponent implements OnInit {

  produits: Produit[] = [];
  filteredProduits: Produit[] = [];
  categories: Categorie[] = [];
  editingId: string | null = null;
  editedProduit: Partial<Produit> = {};

  searchTerm: string = '';
  selectedCategorie: string = '';
  stockFilter: string = '';

  constructor(
    private authService: AuthService,
    private produitsService: ProduitsService,
    private contratService: ContratService
  ) { }

  ngOnInit() {
    this.loadProduits(); 
    this.loadCategories();
  }

  loadCategories() {
    this.produitsService.getCategories()
      .subscribe({
        next: (data) => {
          this.categories = data;
        },
        error: (err) => console.error('Erreur chargement catégories:', err)
      });
  }

  loadProduits() {
    const userId = this.authService.getUserId();

    if (!userId) {
      console.warn('Aucun userId trouvé');
      return;
    }

    this.contratService.getContratActifByUser(userId)
      .subscribe({
        next: (contrats) => {
          const contratActif = contrats.find(c =>
            c.locataire_id?._id === userId &&
            !c.deleted_at &&
            (c.type_contrat === 'INITIAL' || c.type_contrat === 'RENOUVELLEMENT_ACTIF')
          );

          if (!contratActif) {
            console.warn('Aucun contrat actif trouvé');
            return;
          }

          this.produitsService
            .getProduitsByContrat(contratActif._id)
            .subscribe({
              next: (produits) => {
                this.produits = produits;
                this.filteredProduits = produits;
                console.log('Produits chargés:', produits);
              },
              error: (err) => console.error('Erreur chargement produits:', err)
            });
        },
        error: (err) => console.error('Erreur chargement contrats:', err)
      });
  }

  applyFilters() {
    this.filteredProduits = this.produits.filter(p => {

      const matchNom =
        !this.searchTerm ||
        p.nom?.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchCategorie =
        !this.selectedCategorie ||
        (typeof p.id_categorie === 'object' 
          ? p.id_categorie._id === this.selectedCategorie
          : p.id_categorie === this.selectedCategorie);

      const matchStock =
        !this.stockFilter ||
        (this.stockFilter === 'rupture'
          ? p.stock === 0
          : p.stock > 0);

      return matchNom && matchCategorie && matchStock;
    });
  }

  deleteProduit(id: string) {
    if (confirm('Supprimer ce produit ?')) {
      this.produitsService.deleteProduit(id).subscribe({
        next: () => {
          this.produits = this.produits.filter(p => p._id !== id);
          this.applyFilters();
        },
        error: (err) => console.error('Erreur suppression:', err)
      });
    }
  }

  startEdit(produit: Produit) {
    this.editingId = produit._id;
    this.editedProduit = { ...produit };
  }
  
  cancelEdit() {
    this.editingId = null;
    this.editedProduit = {};
  }
  
  saveEdit() {
    if (!this.editedProduit._id) return;

    this.produitsService
      .updateProduit(this.editedProduit._id, this.editedProduit)
      .subscribe({
        next: (updated) => {
          const index = this.produits.findIndex(p => p._id === updated._id);
          if (index !== -1) {
            this.produits[index] = updated;
          }
          this.applyFilters();
          this.cancelEdit();
        },
        error: (err) => console.error('Erreur mise à jour:', err)
      });
  }
}