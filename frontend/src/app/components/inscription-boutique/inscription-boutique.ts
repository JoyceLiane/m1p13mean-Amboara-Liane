import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { Contrat, ContratService } from '../../services/contrat.service';
import { MagasinService } from '../../services/magasin.service';
import { AuthService } from '../../services/auth';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-inscription-boutique',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIf, NgFor],
  templateUrl: './inscription-boutique.html',
  styleUrls: ['./inscription-boutique.css']
})
export class InscriptionBoutiqueComponent implements OnInit {
  nom_magasin = '';
  description = '';
  magasins: any[] = [];
  selectedMagasin = '';

  imageFile: File | undefined = undefined; 

  envoiEnCours = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private contratService: ContratService,
    private magasinService: MagasinService,
    private authService: AuthService,
    private location: Location,
    private router: Router
  ) {}

  ngOnInit() {
    this.chargerMagasinsDisponibles();
  }

  chargerMagasinsDisponibles() {
    this.magasinService.getMagasinsDisponibles().subscribe({
      next: (data) => this.magasins = data,
      error: (err) => {
        console.error('Erreur chargement magasins:', err);
        this.errorMessage = 'Impossible de charger les magasins disponibles';
      }
    });
  }

  onFileSelected(event: any) {
    this.imageFile = event.target.files[0];
  }

  async onInscrireBoutique() {
    if (this.envoiEnCours) return;
    this.envoiEnCours = true;
    this.errorMessage = '';
    this.successMessage = '';
  
    if (!this.nom_magasin.trim()) {
      this.errorMessage = 'Le nom de la boutique est obligatoire';
      this.envoiEnCours = false;
      return;
    }
    if (!this.selectedMagasin) {
      this.errorMessage = 'Veuillez choisir un magasin disponible';
      this.envoiEnCours = false;
      return;
    }
  
    try {
      const currentUser = this.authService.getCurrentUser();
      if (!currentUser?._id) {
        this.errorMessage = 'Utilisateur non connecté';
        this.envoiEnCours = false;
        return;
      }
  
      const contrat: Partial<Contrat> = {
        id: Date.now().toString(),
        id_magasin: { _id: this.selectedMagasin, nom: this.nom_magasin },
        nom_magasin: this.nom_magasin,
        locataire_id: { _id: currentUser._id, nom: currentUser.nom, email: currentUser.email },
        description: this.description,
        type_contrat: 'INITIAL'
      };
  
      // ⚠️ Envoi du contrat avec fichier
      await this.contratService.createContrat(contrat, this.imageFile).toPromise();
  
      alert("Demande d'inscription boutique effectuée avec succès !");
      this.router.navigate(['/client-dashboard']);
    } catch (error) {
      console.error('Erreur inscription boutique:', error);
      this.errorMessage = 'Erreur lors de l’inscription';
      this.envoiEnCours = false;
    }
  }
  

  retour() {
    this.location.back();
  }
}
