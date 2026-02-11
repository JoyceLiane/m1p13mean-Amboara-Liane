import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { MenuComponent } from '../menu/menu.component';
import { FooterComponent } from '../footer/footer.component';
import { MenuService } from '../../services/menu.service';

@Component({
  selector: 'app-layout',
  standalone: true, // IMPORTANT : votre composant est standalone
  imports: [
    CommonModule,    // Pour *ngIf, *ngFor, etc.
    RouterOutlet,    // Pour <router-outlet>
    MenuComponent,   // Pour <app-menu>
    FooterComponent  // Pour <app-footer>
  ],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent implements OnInit {
  isDarkMode = false;
  menuCollapsed = false;
  isAuthenticated = false;

  constructor(
    private menuService: MenuService,
    private router: Router
  ) {}

  ngOnInit() {
    // Vérifier si l'utilisateur est connecté
    this.isAuthenticated = !!localStorage.getItem('token');
    
    // Si PAS connecté, rediriger vers login
    if (!this.isAuthenticated) {
      this.router.navigate(['/login']);
    }
    
    this.menuService.isCollapsed$.subscribe(
      collapsed => this.menuCollapsed = collapsed
    );
    
    this.isDarkMode = localStorage.getItem('theme') === 'dark';
  }
}