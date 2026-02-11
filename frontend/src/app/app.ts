import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from './services/auth';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`,
  styleUrls: ['./app.css']
})
export class App {
  constructor(private router: Router,private authService: AuthService) { }

  goToProfile() {
    this.router.navigate(['/profile']);
  }
  logout() {
    this.authService.logout();
  }
}

