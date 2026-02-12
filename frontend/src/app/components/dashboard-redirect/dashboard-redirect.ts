import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-dashboard-redirect',
  standalone: true,
  template: ''
})
export class DashboardRedirectComponent implements OnInit {

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const role = user?.role_id?.nom?.toLowerCase();

    if (role === 'admin') {
      this.router.navigate(['/admin-dashboard']);
    } 
    else if (role === 'client') {
      this.router.navigate(['/client-dashboard']);
    } 
    else if (role === 'boutique') {
      this.router.navigate(['/shop-dashboard']);
    } 
    else {
      this.router.navigate(['/login']);
    }
  }
}
