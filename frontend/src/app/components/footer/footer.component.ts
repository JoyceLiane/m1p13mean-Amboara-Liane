import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true, 
  imports: [CommonModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {
  currentYear: number = new Date().getFullYear();
  isDarkMode = false;

  ngOnInit() {
    this.isDarkMode = localStorage.getItem('theme') === 'dark';
    
    // Écouter les changements de thème
    window.addEventListener('storage', (event) => {
      if (event.key === 'theme') {
        this.isDarkMode = event.newValue === 'dark';
      }
    });
  }
}