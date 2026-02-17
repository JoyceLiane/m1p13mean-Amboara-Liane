// src/app/services/maintenance.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface DemandeMaintenance {
  _id?: string;
  contrat_id: string | any;
  description: string;
  urgence_id: string | any;
  statut_id: string | any;
  date_demande?: Date;
  cout?: number;
  date_intervention?: Date;
}

export interface UrgenceMaintenance {
  _id: string;
  niveau: string;
  delai_max_jours: number;
  couleur: string;
}

export interface StatutMaintenance {
  _id: string;
  nom: string;
  couleur: string;
  ordre?: number;
}

export interface Contrat {
  _id: string;
  id: string;
  nom_magasin: string;
  date_debut?: Date;
  date_fin?: Date;
  locataire_id?: {
    _id: string;
    nom: string;
    email: string;
    telephone?: string;
    adresse?: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class MaintenanceService {
  private apiUrl = `${environment.apiUrl}/maintenance`;

  constructor(private http: HttpClient) {}

  // CRUD de base
  getAllDemandes(): Observable<DemandeMaintenance[]> {
    return this.http.get<DemandeMaintenance[]>(this.apiUrl);
  }

  getDemandeById(id: string): Observable<DemandeMaintenance> {
    return this.http.get<DemandeMaintenance>(`${this.apiUrl}/${id}`);
  }

  createDemande(demande: Partial<DemandeMaintenance>): Observable<DemandeMaintenance> {
    return this.http.post<DemandeMaintenance>(this.apiUrl, demande);
  }

  updateDemande(id: string, demande: Partial<DemandeMaintenance>): Observable<DemandeMaintenance> {
    return this.http.put<DemandeMaintenance>(`${this.apiUrl}/${id}`, demande);
  }

  deleteDemande(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // Routes spécifiques
  updateStatut(id: string, statut_id: string, statut_nom?: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/statut`, { statut_id, statut_nom });
  }

  planifierIntervention(id: string, date_intervention: Date, cout?: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/planifier`, { date_intervention, cout });
  }

  getDemandesByUrgence(urgenceId: string): Observable<DemandeMaintenance[]> {
    return this.http.get<DemandeMaintenance[]>(`${this.apiUrl}/urgence/${urgenceId}`);
  }

  getDemandesByStatut(statutId: string): Observable<DemandeMaintenance[]> {
    return this.http.get<DemandeMaintenance[]>(`${this.apiUrl}/statut/${statutId}`);
  }

  getDemandesByContrat(contratId: string): Observable<DemandeMaintenance[]> {
    return this.http.get<DemandeMaintenance[]>(`${this.apiUrl}/contrat/${contratId}`);
  }

  getDemandesUrgentesEnAttente(): Observable<DemandeMaintenance[]> {
    return this.http.get<DemandeMaintenance[]>(`${this.apiUrl}/urgentes/en-attente`);
  }
}