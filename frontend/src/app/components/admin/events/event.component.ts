import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EventService, Event } from '../../../services/event.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './event.component.html',
  styleUrls: ['./event.component.css']
})
export class EventsComponent implements OnInit {
  events: Event[] = [];
  filteredEvents: Event[] = [];
  isLoading = true;
  
  // Filtres
  searchTerm = '';
  selectedStatut = 'TOUS';
  statuts = ['TOUS', 'PLANIFIE', 'EN_COURS', 'TERMINE', 'ANNULE'];
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;

  // Statistiques
  stats = {
    total: 0,
    planifie: 0,
    enCours: 0,
    termine: 0,
    annule: 0,
    coutTotal: 0
  };

  constructor(
    private eventService: EventService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadEvents();
  }

  loadEvents() {
    this.isLoading = true;
    this.eventService.getAllEvents().subscribe({
      next: (data) => {
        this.events = data;
        this.calculateStats();
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur chargement événements:', err);
        this.isLoading = false;
      }
    });
  }

  calculateStats() {
    this.stats = {
      total: this.events.length,
      planifie: this.events.filter(e => e.statut === 'PLANIFIE').length,
      enCours: this.events.filter(e => e.statut === 'EN_COURS').length,
      termine: this.events.filter(e => e.statut === 'TERMINE').length,
      annule: this.events.filter(e => e.statut === 'ANNULE').length,
      coutTotal: this.events.reduce((sum, e) => sum + (e.cout || 0), 0)
    };
  }

  applyFilters() {
    let filtered = [...this.events];

    // Filtre par recherche (titre)
    if (this.searchTerm) {
      filtered = filtered.filter(e => 
        e.titre.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    // Filtre par statut
    if (this.selectedStatut !== 'TOUS') {
      filtered = filtered.filter(e => e.statut === this.selectedStatut);
    }

    // Tri par date
    filtered.sort((a, b) => 
      new Date(a.date_debut).getTime() - new Date(b.date_debut).getTime()
    );

    this.filteredEvents = filtered;
    this.totalPages = Math.ceil(this.filteredEvents.length / this.itemsPerPage);
    this.currentPage = 1;
  }

  get paginatedEvents() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredEvents.slice(start, end);
  }

  changePage(page: number) {
    this.currentPage = page;
  }

  getStatutClass(statut: string): string {
    const classes: any = {
      'PLANIFIE': 'badge-planifie',
      'EN_COURS': 'badge-en-cours',
      'TERMINE': 'badge-termine',
      'ANNULE': 'badge-annule'
    };
    return classes[statut] || '';
  }

  getStatutIcon(statut: string): string {
    const icons: any = {
      'PLANIFIE': 'mdi-calendar-clock',
      'EN_COURS': 'mdi-progress-clock',
      'TERMINE': 'mdi-check-circle',
      'ANNULE': 'mdi-cancel'
    };
    return icons[statut] || 'mdi-calendar';
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatCout(cout: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(cout || 0);
  }

  viewEvent(id: string) {
    this.router.navigate(['/admin/events', id]);
  }

  editEvent(id: string) {
    this.router.navigate(['/admin/events/edit', id]);
  }

  deleteEvent(id: string) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
      this.eventService.deleteEvent(id).subscribe({
        next: () => {
          this.loadEvents();
        },
        error: (err) => {
          alert('Erreur lors de la suppression');
        }
      });
    }
  }

  createEvent() {
    this.router.navigate(['/admin/events/new']);
  }

  getMonthStats() {
    const now = new Date();
    this.eventService.getStatsMensuelles(
      now.getFullYear(),
      now.getMonth() + 1
    ).subscribe({
      next: (stats) => {
        console.log('Stats mensuelles:', stats);
      }
    });
  }
}