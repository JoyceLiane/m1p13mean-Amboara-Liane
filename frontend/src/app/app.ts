import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MenuComponent } from './components/menu/menu.component';
import { MenuService } from './services/menu.service';
import { AuthService } from './services/auth'; // ← AJOUTER CET IMPORT
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators'; // ← AJOUTER CET IMPORT
import { FooterComponent } from './components/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    CommonModule,
    MenuComponent,
    FooterComponent
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent {
  title = 'frontend';
  isCollapsed$: Observable<boolean>;
  isLoggedIn$: Observable<boolean>; // ← AJOUTÉ

  constructor(
    private menuService: MenuService,
    private authService: AuthService,
  ) {
    this.isCollapsed$ = this.menuService.isCollapsed$;
    
    // Créer un observable qui émet true/false selon que l'utilisateur est connecté
    this.isLoggedIn$ = this.authService.currentUser$.pipe(
      map(user => !!user) // true si user existe, false sinon
    );
  }
}