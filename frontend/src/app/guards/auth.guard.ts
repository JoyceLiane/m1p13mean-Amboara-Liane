import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    
    // Vérifier si l'utilisateur est authentifié
    if (!this.authService.isAuthenticated()) {
      return this.router.createUrlTree(['/landing']);
    }

    // Vérifier les rôles requis (si spécifiés dans les data de la route)
    const requiredRoles = route.data['roles'] as string[] | undefined;
    
    if (requiredRoles && requiredRoles.length > 0) {
      const userRole = this.authService.getRole()?.toLowerCase();
      
      // Vérifier si l'utilisateur a un rôle autorisé
      const hasRequiredRole = requiredRoles.some(
        role => role.toLowerCase() === userRole
      );

      if (!hasRequiredRole) {
        // Rediriger vers le dashboard approprié selon le rôle
        return this.redirectToRoleDashboard();
      }
    }

    return true;
  }

  /**
   * Rediriger vers le dashboard correspondant au rôle
   */
  private redirectToRoleDashboard(): UrlTree {
    const role = this.authService.getRole()?.toLowerCase();
    
    switch(role) {
      case 'admin':
        return this.router.createUrlTree(['/admin-dashboard']);
      case 'client':
        return this.router.createUrlTree(['/client-dashboard']);
      case 'shop':
      case 'boutique':
        return this.router.createUrlTree(['/shop-dashboard']);
      default:
        return this.router.createUrlTree(['/landing']);
    }
  }
}