import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {

    private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

 getProfile() {
  const token = localStorage.getItem('token');
  if (!token) {
    return throwError(() => new Error('Pas de token'));
  }

  const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
  return this.http.get<any>(`${this.apiUrl}/profile`, { headers })  // ← Ajoute /users
    .pipe(
      catchError(err => {
        console.error('Erreur backend', err);
        return throwError(() => err);
      })
    );
}
  updateProfile(data: any) {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.put(`${this.apiUrl}/profile`, data, { headers });
  }
}
