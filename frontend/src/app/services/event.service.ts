import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth';

export interface Event {
  _id?: string;
  titre: string;
  description?: string;
  date_debut: Date;
  date_fin: Date;
  statut: 'PLANIFIE' | 'EN_COURS' | 'TERMINE' | 'ANNULE';
  cout: number;
  date_creation?: Date;
  created_by?: {
    _id: string;
    nom: string;
    email: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private apiUrl = `${environment.apiUrl}/event`;

  constructor(private http: HttpClient,
    private authService: AuthService
  ) {}

  // CRUD de base
  getAllEvents(): Observable<Event[]> {
    return this.http.get<Event[]>(this.apiUrl);
  }

  getEventById(id: string): Observable<Event> {
    return this.http.get<Event>(`${this.apiUrl}/${id}`);
  }

  createEvent(event: Partial<Event>): Observable<Event> {
  // Récupérer l'utilisateur du BehaviorSubject (synchrone)
  const currentUser = this.authService.getCurrentUser();
  
  if (!currentUser?._id) {
    // Si pas d'utilisateur, essayer de le charger d'abord
    return new Observable(subscriber => {
      this.authService.fetchCurrentUser().subscribe({
        next: (user) => {
          this.http.post<Event>(this.apiUrl, { 
            ...event, 
            created_by: user._id 
          }).subscribe({
            next: (result) => {
              subscriber.next(result);
              subscriber.complete();
            },
            error: (err) => subscriber.error(err)
          });
        },
        error: (err) => subscriber.error(new Error('Utilisateur non connecté'))
      });
    });
  }
  
  // Utilisateur déjà présent, on crée directement
  return this.http.post<Event>(this.apiUrl, { 
    ...event, 
    created_by: currentUser._id 
  });
}

  updateEvent(id: string, event: Partial<Event>): Observable<Event> {
    return this.http.put<Event>(`${this.apiUrl}/${id}`, event);
  }

  deleteEvent(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // Routes spécifiques
  getEventsAVenir(): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.apiUrl}/a-venir`);
  }

  getEventsEnCours(): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.apiUrl}/en-cours`);
  }

  updateStatut(id: string, statut: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/statut`, { statut });
  }

  getEventsParPeriode(debut: string, fin: string): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.apiUrl}/periode/${debut}/${fin}`);
  }

  getEventsParStatut(statut: string): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.apiUrl}/statut/${statut}`);
  }

  getEventsCoutSuperieur(seuil: number): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.apiUrl}/cout/sup/${seuil}`);
  }

  getStatsMensuelles(annee: number, mois: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/stats/mensuelles/${annee}/${mois}`);
  }
}