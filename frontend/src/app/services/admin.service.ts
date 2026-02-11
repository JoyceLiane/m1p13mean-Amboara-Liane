// src/app/services/admin.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';


export interface UserStats {
  total: number;
  active: number;
  inactive: number;
  recent: number;
  byRole: { [key: string]: number };
}

export interface DashboardData {
  success?: boolean;  
  users: any[];
  stats: UserStats;
  data?: any[];  
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

getDashboard(): Observable<DashboardData> {
  return this.http.get<any>(`${this.apiUrl}/admin/dashboard`, {
    headers: this.getHeaders()
  }).pipe(
    map(response => {
      console.log('📦 Réponse brute:', response);
      
      return {
        users: response.users || response.data || [],
        stats: response.stats
      } as DashboardData;
    }),
    catchError(error => {
      console.error('❌ Erreur:', error);
      return throwError(() => error);
    })
  );
}

  // ✅ CORRECTION: Routes avec /admin/
  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/admin/${id}`, {
      headers: this.getHeaders()
    });
  }

  updateUserStatus(id: string, status: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/admin/${id}/status`, 
      { statut_id: status },
      { headers: this.getHeaders() }
    );
  }

  getUser(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/${id}`, {
      headers: this.getHeaders()
    });
  }

  updateUser(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/${id}`, data, {
      headers: this.getHeaders()
    });
  }

  getProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/profile`, {
      headers: this.getHeaders()
    });
  }

  updateProfile(data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/profile`, data, {
      headers: this.getHeaders()
    });
  }
}