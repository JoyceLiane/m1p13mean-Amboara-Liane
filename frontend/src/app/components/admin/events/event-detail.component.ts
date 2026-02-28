import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { EventService, Event } from '../../../services/event.service';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './event-detail.component.html',
  styleUrls: ['./event-detail.component.css']
})
export class EventDetailComponent implements OnInit {
  event: Event | null = null;
  isLoading = true;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventService: EventService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadEvent(id);
    }
  }

  loadEvent(id: string) {
    this.isLoading = true;
    this.eventService.getEventById(id).subscribe({
      next: (data) => {
        this.event = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors du chargement de l\'événement';
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  goBack() {
    this.router.navigate(['/admin/events']);
  }

  editEvent() {
    this.router.navigate(['/admin/events/edit', this.event?._id]);
  }

  deleteEvent() {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
      this.eventService.deleteEvent(this.event!._id!).subscribe({
        next: () => {
          this.router.navigate(['/admin/events']);
        },
        error: (err) => {
          alert('Erreur lors de la suppression');
        }
      });
    }
  }

  updateStatut(statut: string) {
    this.eventService.updateStatut(this.event!._id!, statut).subscribe({
      next: (response) => {
        if (this.event) {
          this.event.statut = statut as any;
        }
        alert(`Statut mis à jour : ${statut}`);
      },
      error: (err) => {
        alert('Erreur lors de la mise à jour du statut');
      }
    });
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
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatCout(cout: number): string {
    return new Intl.NumberFormat('mg-MG', {
      style: 'currency',
      currency: 'MGA'
    }).format(cout || 0);
  }
}