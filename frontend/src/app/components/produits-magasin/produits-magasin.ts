import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProduitsService } from '../../services/produits';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-produits-magasin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './produits-magasin.html',
  styleUrls: ['./produits-magasin.css']
})
export class ProduitsMagasinComponent implements OnInit {
  magasinId: string = '';
  produits: any[] = [];
  filteredProduits: any[] = [];
  categories: any[] = [];
  selectedCategorie: string = '';

  constructor(
    private route: ActivatedRoute,
    private produitsService: ProduitsService
  ) {}

  ngOnInit() {
    this.magasinId = this.route.snapshot.paramMap.get('id') || '';
    this.loadProduits();
    this.loadCategories();
  }

  loadProduits() {
    this.produitsService.getProduitsByMagasin(this.magasinId).subscribe({
      next: data => {
        this.produits = data;
        this.filteredProduits = data;
      },
      error: err => console.error(err)
    });
  }

  loadCategories() {
    this.produitsService.getCategories().subscribe({
      next: data => this.categories = data,
      error: err => console.error(err)
    });
  }

  filterByCategorie() {
    if (!this.selectedCategorie) {
      this.filteredProduits = this.produits;
    } else {
      this.filteredProduits = this.produits.filter(
        p => p.id_categorie._id === this.selectedCategorie
      );
    }
  }
}
