import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-shop-dashboard',
  imports: [],
  templateUrl: './shop-dashboard.html',
  styleUrl: './shop-dashboard.css',
})
export class ShopDashboard {
  constructor(private router: Router,private authService: AuthService) { }

  goToProfile() {
    this.router.navigate(['/profile']);
  }
  logout() {
    this.authService.logout();
  }  
}
