import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="not-found-container">
      <div class="not-found-card">
        <h1>404</h1>
        <h2>Page non trouvée</h2>
        <p>La page que vous recherchez n'existe pas ou a été déplacée.</p>
        <button class="btn-home" routerLink="/admin-dashboard">
          Retour au tableau de bord
        </button>
      </div>
    </div>
  `,
  styles: [`
    .not-found-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 80vh;
    }
    .not-found-card {
      background: white;
      padding: 48px;
      border-radius: 16px;
      text-align: center;
      box-shadow: 0 4px 12px rgba(124, 77, 255, 0.1);
      border: 1px solid #f0f0fa;
      max-width: 500px;
    }
    h1 {
      font-size: 72px;
      margin: 0;
      color: #7c4dff;
      font-weight: 700;
    }
    h2 {
      font-size: 24px;
      margin: 16px 0;
      color: #1e1e2f;
    }
    p {
      color: #6b6b7a;
      margin-bottom: 32px;
    }
    .btn-home {
      padding: 12px 32px;
      background: #7c4dff;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
    }
    .btn-home:hover {
      background: #5e35b1;
    }
    .dark-mode .not-found-card {
      background: #16161d;
      border-color: #2a2a35;
    }
    .dark-mode h2 {
      color: #ffffff;
    }
    .dark-mode p {
      color: #a0a0b0;
    }
  `]
})
export class NotFoundComponent {}