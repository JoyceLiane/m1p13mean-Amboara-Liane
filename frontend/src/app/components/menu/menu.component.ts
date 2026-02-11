import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { MenuService } from '../../services/menu.service';

@Component({
  selector: 'app-menu',
  standalone: true, // IMPORTANT : standalone
  imports: [CommonModule],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {
  isCollapsed = false;
  isDarkMode = false;
  currentUser: any = null;

  constructor(
    private router: Router,
    public authService: AuthService,
    private menuService: MenuService
  ) {}

  ngOnInit() {
    // État du menu
    this.menuService.isCollapsed$.subscribe(
      collapsed => this.isCollapsed = collapsed
    );
    
    // Utilisateur courant
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      this.currentUser = JSON.parse(storedUser);
    }
    
    // Thème
    this.isDarkMode = localStorage.getItem('theme') === 'dark';
  }

  toggleCollapse() {
    this.menuService.toggle();
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

  isActive(route: string): boolean {
    return this.router.url === route;
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }

  getRoleLabel(role: string): string {
    const roles: any = {
      'admin': 'Administrateur',
      'client': 'Client',
      'shop': 'Boutique',
      'boutique': 'Boutique'
    };
    return roles[role?.toLowerCase()] || role || 'Utilisateur';
  }
}