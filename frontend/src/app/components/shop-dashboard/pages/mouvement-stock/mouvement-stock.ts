import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../services/auth';
import { ActivatedRoute } from '@angular/router';
import { MouvementStockService, MouvementStockCreate } from '../../../../services/mouvement-stockcreate';
import { TypeMouvementService } from '../../../../services/type-mouvement';

@Component({
  selector: 'app-mouvement-stock-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mouvement-stock.html',
  styleUrls: ['./mouvement-stock.css']
})
export class MouvementStockPageComponent implements OnInit {

  produitId!: string;
  typeMouvementId: string = '';    
  typeMouvementNom: string = '';   
  quantite: number = 0;
  types: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private mouvementService: MouvementStockService,
    private typeService: TypeMouvementService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.produitId = this.route.snapshot.paramMap.get('produitId')!;
    this.loadTypes();
  }

  loadTypes() {
    this.typeService.getAllTypes()
      .subscribe(data => this.types = data);
  }

  onTypeChange() {
    const selected = this.types.find(t => t._id === this.typeMouvementId);
    this.typeMouvementNom = selected ? selected.nom.toLowerCase() : '';
  }

  createMouvement() {
    const userId = this.authService.getUserId();

    if (!userId || !this.produitId || !this.typeMouvementId || this.quantite <= 0) {
      alert('Formulaire invalide');
      return;
    }

    const isEntree = ['achat', 'retour'].includes(this.typeMouvementNom);
    const isSortie = this.typeMouvementNom === 'vente';

    console.log('Type sélectionné:', this.typeMouvementNom);
    console.log('isEntree:', isEntree, '| isSortie:', isSortie);
    console.log('qt_entree:', isEntree ? this.quantite : 0);
    console.log('qt_sortie:', isSortie ? this.quantite : 0);

    const mouvement: MouvementStockCreate = {
      id: `MVT-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      user_id: userId,
      produits_id: this.produitId,
      qt_entree: isEntree ? this.quantite : 0,
      qt_sortie: isSortie ? this.quantite : 0,
      date_mouvement: new Date(),
      id_type: this.typeMouvementId  
    };

    this.mouvementService.createMouvement(mouvement)
      .subscribe({
        next: () => {
          alert('Mouvement créé avec succès');
          this.quantite = 0;
          this.typeMouvementId = '';
          this.typeMouvementNom = '';
        },
        error: (err) => {
          console.error('Erreur:', err);
          alert('Erreur lors de la création du mouvement');
        }
      });
  }
}