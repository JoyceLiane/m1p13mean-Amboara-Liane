// src/app/services/shop-statistics.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface VenteStatistics {
  totalVentes: number;
  totalRevenu: number;
  ventesAujourdhui: number;
  revenusAujourdhui: number;
  ventesSemaine: number;
  revenusSemaine: number;
  ventesMois: number;
  revenusMois: number;
}

export interface ProduitPopulaire {
  _id: string;
  nom: string;
  totalVendu: number;
  revenu: number;
  imagepath?: string;
}

export interface VenteRecente {
  _id: string;
  produit: {
    _id: string;
    nom: string;
    prix_vente: number;
  };
  quantite: number;
  date_mouvement: Date;
  user?: {
    _id: string;
    nom: string;
    prenom: string;
  };
}

export interface RevenusParJour {
  date: string;
  revenu: number;
  ventes: number;
}

@Injectable({
  providedIn: 'root'
})
export class ShopStatisticsService {
  private apiUrl = `${environment.apiUrl}/shop-statistics`;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // Statistiques générales du shop
  getStatistics(contratId: string): Observable<VenteStatistics> {
    return this.http.get<VenteStatistics>(`${this.apiUrl}/${contratId}`, {
      headers: this.getAuthHeaders()
    });
  }

  // Top produits vendus
  getTopProduits(contratId: string, limit: number = 5): Observable<ProduitPopulaire[]> {
    return this.http.get<ProduitPopulaire[]>(
      `${this.apiUrl}/${contratId}/top-produits?limit=${limit}`,
      { headers: this.getAuthHeaders() }
    );
  }

  // Ventes récentes
  getVentesRecentes(contratId: string, limit: number = 10): Observable<VenteRecente[]> {
    return this.http.get<VenteRecente[]>(
      `${this.apiUrl}/${contratId}/ventes-recentes?limit=${limit}`,
      { headers: this.getAuthHeaders() }
    );
  }

  // Revenus par jour (7 derniers jours)
  getRevenusParJour(contratId: string, jours: number = 7): Observable<RevenusParJour[]> {
    return this.http.get<RevenusParJour[]>(
      `${this.apiUrl}/${contratId}/revenus-par-jour?jours=${jours}`,
      { headers: this.getAuthHeaders() }
    );
  }
}
