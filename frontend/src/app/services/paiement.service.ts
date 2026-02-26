import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Contrat {
  _id: string;
  id: string;
  nom_magasin: string;
  date_debut: Date;
  date_fin: Date;
  locataire_id?: Locataire;
  id_magasin?: Magasin;
}

export interface Locataire {
  _id: string;
  nom: string;
  email: string;
  telephone?: string;
}

export interface Magasin {
  _id: string;
  nom: string;
  superficie: number;
  loyer_mensuel?: number;
}

export interface Paiement {
  _id: string;
  contrat_id: Contrat | string;
  montant: number;
  date_paiement: Date;
  mois_concerne_debut: Date;
  mois_concerne_fin: Date;
  nombre_mois: number;
  montant_par_mois: number;
  penalite?: number;
  notes?: string;
  statut: 'validé' | 'en_attente' | 'annulé';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PaiementRequest {
  contrat_id: string;
  montant: number;
  date_paiement?: Date;
  notes?: string;
  penalite?: number;
}

export interface PaiementMultiMoisRequest {
  contrat_id: string;
  nombre_mois: number;
  montant_total: number;
  date_paiement?: Date;
  notes?: string;
}

export interface SituationPaiement {
  contrat: {
    _id: string;
    nom_magasin: string;
    date_debut: Date;
    date_fin: Date;
    loyer_mensuel: number;
  };
  locataire: Locataire;
  situation: {
    total_paye: number;
    mois_payes: Date[];
    nombre_mois_payes: number;
    dernier_mois_paye: Date | null;
    mois_a_venir: {
      mois: Date;
      montant: number;
      estEnRetard: boolean;
    }[];
    est_a_jour: boolean;
  };
  paiements: Paiement[];
}

export interface OptionPaiement {
  nombre_mois: number;
  montant_total: number;
  periode_debut: Date;
  periode_fin: Date;
  mois_concretes: string;
}
@Injectable({
  providedIn: 'root'
})
export class PaiementService {
  private apiUrl = `${environment.apiUrl}/paiements`;

  constructor(private http: HttpClient) { }

  // CRUD de base
  getAllPaiements(): Observable<Paiement[]> {
    return this.http.get<Paiement[]>(this.apiUrl);
  }

  getPaiementById(id: string): Observable<Paiement> {
    return this.http.get<Paiement>(`${this.apiUrl}/${id}`);
  }

  createPaiement(paiement: PaiementRequest): Observable<Paiement> {
    return this.http.post<Paiement>(this.apiUrl, paiement);
  }

  updatePaiement(id: string, paiement: Partial<Paiement>): Observable<Paiement> {
    return this.http.put<Paiement>(`${this.apiUrl}/${id}`, paiement);
  }

  deletePaiement(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // Routes spécifiques
  getPaiementsByContrat(contratId: string): Observable<Paiement[]> {
    return this.http.get<Paiement[]>(`${this.apiUrl}/contrat/${contratId}`);
  }
  // Ajoutez cette méthode
  getPaiementsByContrats(contratIds: string[]): Observable<any[]> {
    return this.http.post<any[]>(`${this.apiUrl}/contrat`, { contratIds });
  }
  getPaiementsByPeriode(annee: number, mois: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/periode/${annee}/${mois}`);
  }

  getTotalByContrat(contratId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/contrat/${contratId}/total`);
  }

  getDernierPaiement(contratId: string): Observable<Paiement> {
    return this.http.get<Paiement>(`${this.apiUrl}/contrat/${contratId}/dernier`);
  }

  getPaiementsRecents(limit: number = 10): Observable<Paiement[]> {
    return this.http.get<Paiement[]>(`${this.apiUrl}/recent?limit=${limit}`);
  }
  // Routes pour paiements mensuels
  getEcheances(annee: number, mois: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/echeances/${annee}/${mois}`);
  }

  getPaiementsEnRetard(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/retards`);
  }

  payerMois(data: { contrat_id: string; mois: Date; montant: number; date_paiement?: Date }): Observable<Paiement> {
    return this.http.post<Paiement>(`${this.apiUrl}/payer-mois`, data);
  }

  getHistoriqueContrat(contratId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/historique/${contratId}`);
  }

  // Routes pour paiements multi-mois
  payerMultiMois(data: PaiementMultiMoisRequest): Observable<Paiement> {
    return this.http.post<Paiement>(`${this.apiUrl}/payer-multi-mois`, data);
  }

  getSituationPaiement(contratId: string): Observable<SituationPaiement> {
    return this.http.get<SituationPaiement>(`${this.apiUrl}/situation/${contratId}`);
  }

  getOptionsPaiement(contratId: string): Observable<{ options: OptionPaiement[]; loyer_mensuel: number; prochain_mois: Date }> {
    return this.http.get<any>(`${this.apiUrl}/prochains-mois/${contratId}`);
  }
}