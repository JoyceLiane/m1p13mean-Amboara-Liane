import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class RegisterComponent {
  prenom = '';
  nom = '';
  email = '';
  mdp = '';
  phone = '';
  adresse = '';
  role_id = '6989fa451de773231f576b7e';
  statut_id = '698b4e654563d7fc6600ccd6';
  pdpFile: File | null = null;

  errorMessage = '';
  successMessage = '';
  loading = false;

  constructor(private userService: UserService, private router: Router
  ) { }

  onFileSelected(event: any) {
    this.pdpFile = event.target.files[0];
  }

  onRegister() {
    const formData = new FormData();
    formData.append('prenom', this.prenom);
    formData.append('nom', this.nom);
    formData.append('email', this.email);
    formData.append('mdp', this.mdp);
    formData.append('phone', this.phone);
    formData.append('adresse', this.adresse);
    formData.append('role_id', this.role_id);
    formData.append('statut_id', this.statut_id);

    if (this.pdpFile) {
      formData.append('pdp', this.pdpFile);
    }

    this.userService.createUser(formData).subscribe({
      next: (res) => {
        alert("Inscription réussie! Vous pouvez désormais vous connectez");
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors de l’inscription';
      }
    });
  }
  goToLanding()
  {
    this.router.navigate(['/landing']);
  }
}
