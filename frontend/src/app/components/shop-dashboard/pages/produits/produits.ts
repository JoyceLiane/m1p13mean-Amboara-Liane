import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../services/auth';
import { ProduitsService } from '../../../../services/produits';

@Component({
  selector: 'app-produits-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './produits.html',
  styleUrl: './produits.css',
})
export class ProduitsPageComponent implements OnInit {

  produits: any[] = [];
  filteredProduits: any[] = [];

  searchTerm: string = '';
  selectedCategorie: string = '';
  stockFilter: string = '';

  constructor(
    private authService: AuthService,
    private produitsService: ProduitsService
  ) {}

  ngOnInit() {
    const userId = this.authService.getUserId();
    if (userId) {
      this.loadProduits(userId);
    }
  }

  loadProduits(userId: string) {
    this.produitsService.getProduitsByContrat(userId)
      .subscribe(data => {
        this.produits = data;
        this.filteredProduits = data;
      });
  }

  applyFilters() {
    this.filteredProduits = this.produits.filter(p => {

      const matchNom =
        !this.searchTerm ||
        p.nom?.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchCategorie =
        !this.selectedCategorie ||
        p.id_categorie?._id === this.selectedCategorie;

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
      this.produitsService.deleteProduit(id).subscribe(() => {
        this.produits = this.produits.filter(p => p._id !== id);
        this.applyFilters();
      });
    }
  }
}
