import { Component } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'app-client-dashboard',
  imports: [],
  templateUrl: './client-dashboard.html',
  styleUrl: './client-dashboard.css',
})

export class ClientDashboard {
  
    constructor(private router: Router) {}
  
    goToProfile() {
      this.router.navigate(['/profile']);
    }  
}
