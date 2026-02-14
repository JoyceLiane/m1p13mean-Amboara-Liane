// src/app/services/mouvement-stock.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { environment } from '../../environments/environment';

export interface MouvementStockCreate {
  id: string;
  user_id: string;
  produits_id: string;
  qt_entree: number;
  qt_sortie: number;
  date_mouvement: Date;
  id_type: string;
}

@Injectable({
  providedIn: 'root'
})
export class MouvementStockService {
  private apiUrl = `${environment.apiUrl}/mouvements`;

  constructor(private http: HttpClient) {}

  createMouvement(mouvement: MouvementStockCreate): Observable<any> {
    return this.http.post(this.apiUrl, mouvement);
  }

  // Créer plusieurs mouvements en une seule fois (pour un panier)
  createMouvementsBatch(mouvements: MouvementStockCreate[]): Observable<any[]> {
    const requests = mouvements.map(m => this.createMouvement(m));
    return forkJoin(requests);
  }

  getAllMouvements(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getMouvementById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }
}