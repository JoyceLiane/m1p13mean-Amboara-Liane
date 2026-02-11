import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    
    // Récupérer les rôles autorisés depuis les data de la route
    const allowedRoles = route.data['roles'] as string[] | undefined;
    
    if (!allowedRoles || allowedRoles.length === 0) {
      return true; // Aucune restriction de rôle
    }

    // Vérifier si l'utilisateur a un rôle autorisé
    const userRole = this.authService.getRole()?.toLowerCase();
    const hasAccess = allowedRoles.some(role => role.toLowerCase() === userRole);

    if (hasAccess) {
      return true;
    }

    // Rediriger vers la page non autorisée ou dashboard
    return this.router.createUrlTree(['/non-autorise']);
  }
}