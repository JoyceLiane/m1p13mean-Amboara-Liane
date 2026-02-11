import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

export interface LoginResponse {
  token: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  login(email: string, mdp: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { email, mdp })
      .pipe(
        tap(response => {
          // Sauvegarder le token et le rôle
          localStorage.setItem('token', response.token);
          localStorage.setItem('role', response.role);
        })
      );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    this.router.navigate(['/login']);
  }

  getRole(): string | null {
    return localStorage.getItem('role');
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  isAdmin(): boolean {
    return this.getRole()?.toLowerCase() === 'admin';
  }

  isClient(): boolean {
    return this.getRole()?.toLowerCase() === 'client';
  }

  isShop(): boolean {
    return this.getRole()?.toLowerCase() === 'shop';
  }

  // Rediriger selon le rôle
  redirectToDashboard(): void {
    const role = this.getRole()?.toLowerCase();
    
    switch(role) {
      case 'admin':
        this.router.navigate(['/admin-dashboard']);
        break;
      case 'client':
        this.router.navigate(['/client-dashboard']);
        break;
      case 'shop':
        this.router.navigate(['/shop-dashboard']);
        break;
      default:
        this.router.navigate(['/login']);
    }
  }
}