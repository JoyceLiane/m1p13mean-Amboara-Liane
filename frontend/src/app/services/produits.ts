// src/app/services/produits.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Produit, Categorie } from '../models/produit';

@Injectable({
  providedIn: 'root'
})
export class ProduitsService {
  private apiUrl = `${environment.apiUrl}/produits`; 

  constructor(private http: HttpClient) {}

  getProduitsByContrat(contratId: string): Observable<Produit[]> {
    return this.http.get<Produit[]>(`${this.apiUrl}/contrat/${contratId}`);
  }

  getCategories(): Observable<Categorie[]> {
    return this.http.get<Categorie[]>(`${environment.apiUrl}/categorieProduits`);
  }

  getAllProduits(): Observable<Produit[]> {
    return this.http.get<Produit[]>(this.apiUrl);
  }

  getProduitById(id: string): Observable<Produit> {
    return this.http.get<Produit>(`${this.apiUrl}/${id}`);
    //                             ^ manquait la parenthèse
  }
  getProduitsActifs(): Observable<Produit[]> {
    return this.http.get<Produit[]>(`${this.apiUrl}/actifs`);
  }
  createProduit(data: FormData) {
    return this.http.post(`${this.apiUrl}`, data);
  }
  
  // createProduit(data: Partial<Produit>): Observable<Produit> {
  //   return this.http.post<Produit>(this.apiUrl, data);
  // }
  
  updateProduit(id: string, data: Partial<Produit>): Observable<Produit> {
    return this.http.put<Produit>(`${this.apiUrl}/${id}`, data);
    //                             ^ manquait la parenthèse
  }
  
  deleteProduit(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
    //                       ^ manquait la parenthèse
  }
}