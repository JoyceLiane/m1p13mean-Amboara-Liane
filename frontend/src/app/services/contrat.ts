import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ContratService {
  private apiUrl = 'http://localhost:5000/contrat';

  constructor(private http: HttpClient) {}

  getContrats(): Observable<any> {
    return this.http.get(this.apiUrl);
  }
}
