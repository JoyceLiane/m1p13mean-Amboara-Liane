// src/app/services/reference-data.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { UrgenceMaintenance, StatutMaintenance } from './maintenance.service';

export interface Locataire {
  _id: string;
  nom: string;
  email: string;
  telephone: string;
  adresse?: string;
}

export interface Contrat {
  _id: string;
  id: string;
  nom_magasin: string;
  locataire_id: Locataire | string;
  date_debut: Date;
  date_fin: Date;
  statut: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReferenceDataService {
  private apiUrl = environment.apiUrl;
  
  private urgencesCache = new BehaviorSubject<UrgenceMaintenance[]>([]);
  private statutsCache = new BehaviorSubject<StatutMaintenance[]>([]);
  private contratsCache = new BehaviorSubject<Contrat[]>([]);

  constructor(private http: HttpClient) {
    this.loadUrgences();
    this.loadStatuts();
  }

  // Urgences
  getUrgences(): Observable<UrgenceMaintenance[]> {
    return this.urgencesCache.asObservable();
  }

  loadUrgences(): void {
    this.http.get<UrgenceMaintenance[]>(`${this.apiUrl}/urgenceMaintenance`)
      .pipe(catchError(err => {
        console.error('Erreur chargement urgences', err);
        return of([]);
      }))
      .subscribe(urgences => this.urgencesCache.next(urgences));
  }

  getUrgenceById(id: string): Observable<UrgenceMaintenance | undefined> {
    return this.urgencesCache.pipe(
      map(urgences => urgences.find(u => u._id === id))
    );
  }

  // Statuts
  getStatuts(): Observable<StatutMaintenance[]> {
    return this.statutsCache.asObservable();
  }

  loadStatuts(): void {
    this.http.get<StatutMaintenance[]>(`${this.apiUrl}/status-maintenance`)
      .pipe(catchError(err => {
        console.error('Erreur chargement statuts', err);
        return of([]);
      }))
      .subscribe(statuts => this.statutsCache.next(statuts));
  }

  getStatutById(id: string): Observable<StatutMaintenance | undefined> {
    return this.statutsCache.pipe(
      map(statuts => statuts.find(s => s._id === id))
    );
  }

  // Contrats
  getContrats(): Observable<Contrat[]> {
    return this.http.get<Contrat[]>(`${this.apiUrl}/contrats`);
  }

  getContratsByLocataire(locataireId: string): Observable<Contrat[]> {
    return this.http.get<Contrat[]>(`${this.apiUrl}/contrat/locataire/${locataireId}`);
  }

  getContratById(id: string): Observable<Contrat> {
    return this.http.get<Contrat>(`${this.apiUrl}/contrats/${id}`);
  }
}