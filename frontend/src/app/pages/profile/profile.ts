import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html'
})
export class ProfileComponent implements OnInit {

  user: any = {};

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.userService.getProfile().subscribe({
      next: data => this.user = data,
      error: err => {
        if (err.status === 401) {
          console.warn('Non autorisé ou token manquant');
          // rediriger vers login si nécessaire
        } else {
          console.error('Erreur inconnue', err);
        }
      }
    });
    
  }

  save() {
    this.userService.updateProfile(this.user).subscribe(() => {
      alert('Profil mis à jour');
    });
  }
}
