import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProduitsService } from '../../../../services/produits';
import { CategorieProduitsService, CategorieProduit } from '../../../../services/categorie-produits';
import { Router } from '@angular/router';
import { AuthService } from '../../../../services/auth';
import { ContratService } from '../../../../services/contrat.service';

@Component({
  selector: 'app-create-produit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-produit.html',
  styleUrls: ['./create-produit.css']
})
export class CreateProduitComponent implements OnInit {
  nom = '';
  id_categorie = '';
  id_vendeur = ''; // choisi via select
  prix: number | null = null;
  description = '';
  stock: number = 0;
  imageFile: File | null = null;

  categories: CategorieProduit[] = [];
  contrats: any[] = []; // liste des contrats de l’utilisateur

  errorMessage = '';
  successMessage = '';
  loading = false;

  constructor(
    private produitsService: ProduitsService,
    private categorieService: CategorieProduitsService,
    private router: Router,
    private contratService: ContratService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Charger les catégories
    this.categorieService.getAllCategories().subscribe({
      next: (cats) => this.categories = cats,
      error: (err) => console.error('Erreur chargement catégories:', err)
    });

    // Charger les contrats de l’utilisateur connecté
    const currentUser = this.authService.getCurrentUser();
    if (currentUser?._id) {
      this.contratService.getContratActifByUser(currentUser._id).subscribe({
        next: (contrats) => {
          this.contrats = contrats.filter(c =>
            c.locataire_id?._id === currentUser._id &&
            !c.deleted_at &&
            (
              (typeof c.status_id === 'object' && c.status_id?.nom === 'EN_ATTENTE') ||
              (typeof c.status_id === 'string' && c.status_id === 'EN_ATTENTE') // au cas où
            )
          );
          
        },
        error: (err) => console.error('Erreur chargement contrats:', err)
      });
    }
  }

  
  
  onFileSelected(event: any) {
    this.imageFile = event.target.files[0];
  }

  onCreateProduit() {
    this.loading = true;
    const formData = new FormData();
    formData.append('nom', this.nom);
    formData.append('id_categorie', this.id_categorie);
    formData.append('id_vendeur', this.id_vendeur); // choisi via select
    if (this.prix !== null) formData.append('prix', this.prix.toString());
    formData.append('description', this.description);
    formData.append('stock', this.stock.toString());
    if (this.imageFile) {
      formData.append('image', this.imageFile);
    }

    this.produitsService.createProduit(formData).subscribe({
      next: () => {
        alert('Produit créé avec succès !');
        this.loading = false;
        this.router.navigate(['/shop-produits']);
      },
      error: () => {
        this.errorMessage = 'Erreur lors de la création du produit';
        this.loading = false;
      }
    });
  }
}