import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProduitsService {
  private apiUrl = 'http://localhost:5000'; // ton backend

  constructor(private http: HttpClient) {}

  getProduitsByMagasin(magasinId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/produits/magasin/${magasinId}`);
  }

  getCategories(): Observable<any> {
    return this.http.get(`${this.apiUrl}/categorie_produits`);
  }
}
