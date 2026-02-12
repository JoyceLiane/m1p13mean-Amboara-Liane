import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

export interface LoginResponse {
  token: string;
  role: string;
  user?: any; // Optionnel: si votre API retourne les infos utilisateur
}

export interface User {
  id: number;
  prenom: string;
  nom: string;
  email: string;
  phone?: string;
  adresse?: string;
  pdp?: string;
  role_id?: {
    id: number;
    nom: string;
  };
  statut_id?: {
    id: number;
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
  
  // BehaviorSubject pour l'utilisateur courant
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  // BehaviorSubject pour l'état d'authentification
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Charger l'utilisateur au démarrage si token présent
    this.loadStoredUser();
  }

  /**
   * Connexion
   */
  login(email: string, mdp: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, { email, mdp })
      .pipe(
        tap(response => {
  
          localStorage.setItem('token', response.token);
          localStorage.setItem('role', response.role);
  
          this.isAuthenticatedSubject.next(true);
  
          // Charger profil via /profile
          this.fetchCurrentUser().subscribe();
        })
      );
  }
  

  /**
   * Déconnexion
   */
  logout(): void {
    // Nettoyer le localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    
    // Mettre à jour les subjects
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    
    // Rediriger vers login
    this.router.navigate(['/login']);
  }

  /**
   * Récupérer les informations de l'utilisateur courant
   */
  fetchCurrentUser(): Observable<User> {
    const token = this.getToken();
    return this.http.get<User>(`${this.apiUrl}/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    }).pipe(tap(user => this.setCurrentUser(user)));
  }
  

  /**
   * Définir l'utilisateur courant
   */
  setCurrentUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  /**
   * Charger l'utilisateur stocké
   */
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

  /**
   * Vérifier si un token existe
   */
  private hasToken(): boolean {
    return !!localStorage.getItem('token');
  }

  /**
   * Getters synchrones (pour les cas où on a besoin d'une valeur immédiate)
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
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




  /**
   * Vérifier si l'utilisateur a tous les rôles d'une liste
   */
  hasAllRoles(roles: string[]): boolean {
    const userRole = this.getRole()?.toLowerCase();
    return roles.every(role => role.toLowerCase() === userRole);
  }

  /**
   * Obtenir le niveau hiérarchique d'un rôle
   */
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

  /**
   * Vérifier si l'utilisateur a un niveau supérieur ou égal
   */
  hasMinLevel(requiredLevel: number): boolean {
    return this.getRoleLevel() >= requiredLevel;
  }
  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.role_id?.nom?.toLowerCase() === role.toLowerCase();
  }
  

  /**
   * Vérifier si l'utilisateur a un rôle parmi une liste
   */
  hasAnyRole(roles: string[]): boolean {
    const userRole = this.getRole()?.toLowerCase();
    return roles.some(role => role.toLowerCase() === userRole);
  }

  /**
   * Récupérer l'URL du dashboard selon le rôle
   */
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

  /**
   * Rediriger selon le rôle
   */
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
  

  /**
   * Mettre à jour le profil utilisateur
   */
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

  /**
   * Changer le mot de passe
   */
  changePassword(oldPassword: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/change-password`, {
      oldPassword,
      newPassword
    });
  }
}