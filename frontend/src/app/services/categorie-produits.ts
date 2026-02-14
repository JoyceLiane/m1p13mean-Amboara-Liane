// src/app/services/categorie-produits.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CategorieProduit {
  _id: string;
  nom: string;
  description?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CategorieProduitsService {
  private apiUrl = `${environment.apiUrl}/categorie_produits`;

  constructor(private http: HttpClient) {}

  getAllCategories(): Observable<CategorieProduit[]> {
    return this.http.get<CategorieProduit[]>(this.apiUrl);
  }

  getCategorieById(id: string): Observable<CategorieProduit> {
    return this.http.get<CategorieProduit>(`${this.apiUrl}/${id}`);
  }

  createCategorie(categorie: Partial<CategorieProduit>): Observable<CategorieProduit> {
    return this.http.post<CategorieProduit>(this.apiUrl, categorie);
  }

  updateCategorie(id: string, categorie: Partial<CategorieProduit>): Observable<CategorieProduit> {
    return this.http.put<CategorieProduit>(`${this.apiUrl}/${id}`, categorie);
  }

  deleteCategorie(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}