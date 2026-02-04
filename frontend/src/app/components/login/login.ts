import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

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

  onLogin() {
    console.log('Tentative de connexion avec', this.email, this.mdp);
  }
}
