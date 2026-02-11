import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';
import { CarteSupermarcheComponent } from '../carte-supermarche/carte-supermarche';


@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [CommonModule,CarteSupermarcheComponent],
  templateUrl: './client-dashboard.html',
  styleUrl: './client-dashboard.css',
})

export class ClientDashboard {

  constructor(private router: Router,private authService: AuthService) { }

  goToProfile() {
    this.router.navigate(['/profile']);
  }
  logout() {
    this.authService.logout();
  }
}
