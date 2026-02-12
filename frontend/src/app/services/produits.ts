import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProduitsService {
  private apiUrl = `${environment.apiUrl}`; 

  constructor(private http: HttpClient) {}

  getProduitsByMagasin(magasinId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/produits/magasin/${magasinId}`);
  }

  getCategories(): Observable<any> {
    return this.http.get(`${this.apiUrl}/categorie_produits`);
  }
}
