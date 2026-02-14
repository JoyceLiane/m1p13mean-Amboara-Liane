// src/app/services/type-mouvement.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TypeMouvementService {
  private apiUrl = `${environment.apiUrl}/types_mouvements`;

  constructor(private http: HttpClient) {}

  getAllTypes(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getTypeByNom(nom: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/nom/${nom}`);
  }
}