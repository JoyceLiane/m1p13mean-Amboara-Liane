// src/app/services/produits.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProduitsService {
  private apiUrl = `${environment.apiUrl}/produits`; 

  constructor(private http: HttpClient) {}

  getProduitsByContrat(contratId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/contrat/${contratId}`);
  }

  getCategories(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/categorie_produits`);
  }

  getAllProduits(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getProduitById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }
  createProduit(data: any) {
    return this.http.post(this.apiUrl, data);
  }
  
  updateProduit(id: string, data: any) {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }
  
  deleteProduit(id: string) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
  
}