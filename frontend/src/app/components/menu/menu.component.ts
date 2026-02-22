import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { MenuService, Menu } from '../../services/menu.service';
import { UrlHelper } from '../../services/url.helper';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit, OnDestroy {
  isCollapsed = false;
  isDarkMode = false;
  currentUser: any = null;
  menus: Menu[] = [];
  expandedMenus: { [key: string]: boolean } = {};
  isLoading = true;
  isLoggedIn = false; // ← AJOUTÉ pour tracker l'état de connexion
  private subscriptions: Subscription[] = [];

  constructor(
    private router: Router,
    public authService: AuthService,
    private menuService: MenuService,
    public urlHelper: UrlHelper
  ) {}

  ngOnInit() {
    // Abonnement aux changements de user
    this.subscriptions.push(
      this.authService.currentUser$.subscribe(user => {
        this.currentUser = user;
        this.isLoggedIn = !!user;
  
        if (user) {
          console.log('👤 Utilisateur connecté:', user.prenom);
          this.isLoading = true;
          this.menuService.refreshMenu(); // ← fetch uniquement si connecté
        } else {
          console.log('👤 Utilisateur déconnecté');
          this.menus = [];
          this.expandedMenus = {};
          this.menuService.clearMenu();
          this.isLoading = false;
        }
      })
    );
  
    // Ne pas charger le menu si pas de token
    const token = localStorage.getItem('token');
    if (token && !this.currentUser) {
      console.log('🔄 Token trouvé, chargement du menu...');
      this.isLoading = true;
      this.menuService.refreshMenu();
    }
  }
  

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  toggleCollapse() {
    this.menuService.toggleCollapse();
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
    
    if (this.isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }

  toggleSubmenu(menuId: string, event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.expandedMenus[menuId] = !this.expandedMenus[menuId];
  }

  isActive(route: string): boolean {
    return this.router.url === route;
  }

  navigateTo(route: string, menuId?: string) {
    if (route) {
      console.log('➡️ Navigation vers:', route);
      this.router.navigate([route]);
    } else if (menuId) {
      this.toggleSubmenu(menuId, new Event('click'));
    }
  }

  logout() {
    console.log('🚪 Déconnexion...');
    
    // 1. Vider le menu IMMÉDIATEMENT
    this.menus = [];
    this.expandedMenus = {};
    this.isLoggedIn = false;
    this.currentUser = null;
    
    // 2. Vider le service
    this.menuService.clearMenu();
    
    // 3. Supprimer le token
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    
    // 4. Rediriger (la redirection est rapide mais le menu est déjà vide)
    this.router.navigate(['/login']);
  }

  getRoleLabel(role: string): string {
    const roles: any = {
      'admin': 'Administrateur',
      'client': 'Client',
      'boutique': 'Boutique'
    };
    return roles[role?.toLowerCase()] || role || 'Utilisateur';
  }

  hasChildren(menu: Menu): boolean {
    return !!(menu.children && menu.children.length > 0);
  }

  trackByMenuId(index: number, menu: Menu): string {
    return menu._id;
  }
}