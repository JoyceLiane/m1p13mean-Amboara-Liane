import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ContratService {
  private apiUrl = `${environment.apiUrl}/contrat`;

  constructor(private http: HttpClient) {}

  getContrats(): Observable<any> {
    return this.http.get(this.apiUrl);
  }
}
