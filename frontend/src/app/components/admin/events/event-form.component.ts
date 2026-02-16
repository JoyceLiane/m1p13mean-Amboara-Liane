import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EventService, Event } from '../../../services/event.service';

@Component({
  selector: 'app-event-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './event-form.component.html',
  styleUrls: ['./event-form.component.css']
})
export class EventFormComponent implements OnInit {
  event: Partial<Event> = {
    titre: '',
    description: '',
    date_debut: new Date(),
    date_fin: new Date(),
    statut: 'PLANIFIE',
    cout: 0
  };
  
  isEditMode = false;
  isLoading = false;
  errorMessage = '';
  minDate: string;

  statuts = ['PLANIFIE', 'EN_COURS', 'TERMINE', 'ANNULE'];

  constructor(
    private eventService: EventService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    // Date minimum = aujourd'hui
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
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
        this.errorMessage = 'Erreur lors du chargement';
        this.isLoading = false;
      }
    });
  }

  onSubmit() {
    this.isLoading = true;
    this.errorMessage = '';

    // Validation
    if (new Date(this.event.date_fin!) < new Date(this.event.date_debut!)) {
      this.errorMessage = 'La date de fin doit être après la date de début';
      this.isLoading = false;
      return;
    }

    const request = this.isEditMode
      ? this.eventService.updateEvent(this.event._id!, this.event)
      : this.eventService.createEvent(this.event);

    request.subscribe({
      next: () => {
        this.router.navigate(['/admin/events']);
      },
      error: (err) => {
        this.errorMessage = err.error?.error || 'Erreur lors de l\'enregistrement';
        this.isLoading = false;
      }
    });
  }

  onCancel() {
    this.router.navigate(['/admin/events']);
  }
}