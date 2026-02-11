import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  email: string = '';
  mdp: string = '';

  constructor(private authService: AuthService) {}

  onLogin() {
    this.authService.login(this.email, this.mdp).subscribe({
      next: (res) => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('role', res.role);
        // alert(`Connecté en tant que ${res.role}`);
        if (res.role === 'admin') window.location.href = '/admin-dashboard';
        else if (res.role === 'boutique') window.location.href = '/shop-dashboard';
        else window.location.href = '/client-dashboard';
      },
      error: (err) => alert(err.error.error)
    });
  }
}
