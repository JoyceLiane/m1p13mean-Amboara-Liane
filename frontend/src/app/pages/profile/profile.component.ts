import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Location } from '@angular/common';
import { UrlHelper } from '../../services/url.helper';
@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
isDarkMode = false;
  user: any = {};
  
  constructor(private userService: UserService ,private location: Location,public urlHelper: UrlHelper) {}
  goback() {
    this.location.back();
  } 
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
   toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
  }

  save() {
    this.userService.updateProfile(this.user).subscribe(() => {
      alert('Profil mis à jour');
    });
  }
}
