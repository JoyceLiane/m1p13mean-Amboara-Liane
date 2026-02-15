import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

export interface LoginResponse {
  token: string;
  role: string;
  user?: any;
}

export interface User {
  _id?: string;       // MongoDB ID (string)
  id?: number;        // ID optionnel pour compatibilité
  prenom: string;
  nom: string;
  email: string;
  phone?: string;
  adresse?: string;
  pdp?: string;
  role_id?: {
    _id?: string;
    id?: number;
    nom: string;
  };
  statut_id?: {
    _id?: string;
    id?: number;
    nom: string;
  };
  created_on?: Date;
  updated_at?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/users`;
  
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.loadStoredUser();
  }

  login(email: string, mdp: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, { email, mdp })
      .pipe(
        tap(response => {
          localStorage.setItem('token', response.token);
          localStorage.setItem('role', response.role);
          this.isAuthenticatedSubject.next(true);
          this.fetchCurrentUser().subscribe();
        })
      );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/login']);
  }

  fetchCurrentUser(): Observable<User> {
    const token = this.getToken();
    return this.http.get<User>(`${this.apiUrl}/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    }).pipe(tap(user => this.setCurrentUser(user)));
  }

  setCurrentUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  private loadStoredUser(): void {
    const token = localStorage.getItem('token');
    if (token) {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          this.currentUserSubject.next(user);
        } catch (e) {
          console.error('Erreur parsing utilisateur stocké', e);
          this.fetchCurrentUser().subscribe();
        }
      } else {
        this.fetchCurrentUser().subscribe();
      }
    }
  }

  private hasToken(): boolean {
    return !!localStorage.getItem('token');
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getUserId(): string | null {
    const user = this.getCurrentUser();
    if (!user) return null;
    return user._id?.toString() || user.id?.toString() || null;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getRole(): string | null {
    return localStorage.getItem('role');
  }

  isAuthenticated(): boolean {
    return this.hasToken();
  }

  isAdmin(): boolean {
    return this.hasRole('admin');
  }

  isClient(): boolean {
    return this.hasRole('client');
  }

  isShop(): boolean {
    return this.hasRole('shop') || this.hasRole('boutique');
  }

  hasAllRoles(roles: string[]): boolean {
    const userRole = this.getRole()?.toLowerCase();
    return roles.every(role => role.toLowerCase() === userRole);
  }

  getRoleLevel(role?: string): number {
    const roleLevels: { [key: string]: number } = {
      'admin': 100,
      'superadmin': 100,
      'shop': 50,
      'boutique': 50,
      'client': 30
    };
    
    const roleToCheck = role || this.getRole() || 'user';
    return roleLevels[roleToCheck.toLowerCase()] || 0;
  }

  hasMinLevel(requiredLevel: number): boolean {
    return this.getRoleLevel() >= requiredLevel;
  }

  // hasRole(role: string): boolean {
  //   const user = this.getCurrentUser();
  //   return user?.role_id?.nom?.toLowerCase() === role.toLowerCase();
  // }
  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    const roleFromProfile = user?.role_id?.nom?.toLowerCase();
    const roleFromStorage = this.getRole()?.toLowerCase();
  
    return roleFromProfile === role.toLowerCase() ||
           roleFromStorage === role.toLowerCase();
  }
  
  hasAnyRole(roles: string[]): boolean {
    const userRole = this.getRole()?.toLowerCase();
    return roles.some(role => role.toLowerCase() === userRole);
  }

  getDashboardUrl(): string {
    const role = this.getRole()?.toLowerCase();
    
    switch(role) {
      case 'admin': return '/admin-dashboard';
      case 'client': return '/client-dashboard';
      case 'shop':
      case 'boutique': return '/shop-dashboard';
      default: return '/login';
    }
  }

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
      case 'boutique':
        this.router.navigate(['/shop-dashboard']);
        break;
      default:
        this.router.navigate(['/login']);
    }
  }

  updateProfile(userData: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/profile`, userData).pipe(
      tap(updatedUser => {
        const currentUser = this.getCurrentUser();
        if (currentUser) {
          const newUser = { ...currentUser, ...updatedUser };
          this.setCurrentUser(newUser);
        }
      })
    );
  }

  changePassword(oldPassword: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/change-password`, {
      oldPassword,
      newPassword
    });
  }
}