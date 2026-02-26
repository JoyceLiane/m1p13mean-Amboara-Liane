// src/app/components/login/login.component.ts
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { UrlHelper } from '../../services/url.helper';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  email: string = '';
  mdp: string = '';
  loading: boolean = false;
  errorMessage: string = '';

  constructor(
    private authService: AuthService,
    public urlHelper: UrlHelper,
    private router: Router
  ) {}

  onLogin() {
    this.loading = true;
    this.errorMessage = '';

    this.authService.login(this.email, this.mdp).subscribe({
      next: (res) => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('role', res.role);
        if (res.role === 'admin') {
          this.router.navigate(['/admin-dashboard']);
        } else if (res.role === 'boutique') {
          this.router.navigate(['/shop-dashboard']);
        } else {
          this.router.navigate(['/client-dashboard']);
        }
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.error || 'Erreur de connexion';
      }
    });
  }
  goToLanding()
  {
    this.router.navigate(['/landing']);
  }
}