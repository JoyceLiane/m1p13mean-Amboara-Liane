import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth';

export interface Contrat {
  _id?: string;
  id: string;
  id_magasin: {
    _id: string;
    nom: string;
    superficie?: number;
    etage?: number;
    prix_m2?: number;
  };
  nom_magasin: string;
  locataire_id: {
    _id: string;
    nom: string;
    email: string;
    telephone?: string;
  };
  description?: string;
  date_debut?: Date;
  date_fin?: Date;
  type_contrat: 'INITIAL' | 'RENOUVELLEMENT_ACTIF' | 'DEMANDE_RENOUVELLEMENT';
  statut_demande?: 'EN_ATTENTE' | 'APPROUVEE' | 'REFUSEE';
  contrat_parent_id?: {
    _id: string;
    id: string;
    date_debut: Date;
    date_fin: Date;
  };
  status_id: {
    _id: string;
    nom: string;
    couleur: string;
    description?: string;
  };
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ContratService {
  private apiUrl = `${environment.apiUrl}/contrat`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  getAllContrats(): Observable<Contrat[]> {
    return this.http.get<Contrat[]>(this.apiUrl);
  }


  getContratById(id: string): Observable<Contrat> {
    return this.http.get<Contrat>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crée un nouveau contrat
   */
  createContrat(contrat: Partial<Contrat>): Observable<Contrat> {
    const currentUser = this.authService.getCurrentUser();

    if (!currentUser?._id) {
      return new Observable(subscriber => {
        this.authService.fetchCurrentUser().subscribe({
          next: (user) => {
            this.http.post<Contrat>(this.apiUrl, {
              ...contrat,
              created_by: user._id
            }).subscribe({
              next: (result) => {
                subscriber.next(result);
                subscriber.complete();
              },
              error: (err) => subscriber.error(err)
            });
          },
          error: (err) => subscriber.error(new Error('Utilisateur non connecté'))
        });
      });
    }

    return this.http.post<Contrat>(this.apiUrl, {
      ...contrat,
      created_by: currentUser._id
    });
  }

  /**
   * Met à jour un contrat
   */
  updateContrat(id: string, contrat: Partial<Contrat>): Observable<Contrat> {
    return this.http.put<Contrat>(`${this.apiUrl}/${id}`, contrat);
  }

  /**
   * Supprime un contrat (soft delete)
   */
  deleteContrat(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // ==================== ROUTES SPÉCIFIQUES LOCATAIRE ====================

  /**
   * Récupère les contrats d'un locataire (sans filtre type_contrat)
   */
  getContratsByLocataire(locataireId: string): Observable<Contrat[]> {
    return this.http.get<Contrat[]>(`${this.apiUrl}/locataire/${locataireId}`);
  }

  /**
   * Récupère les contrats d'un utilisateur (avec filtre type_contrat)
   */
  getContratsByUser(userId: string): Observable<Contrat[]> {
    return this.http.get<Contrat[]>(`${this.apiUrl}/user/${userId}`);
  }

  /**
   * Récupère les demandes de renouvellement en cours d'un locataire
   */
  getDemandesEnCours(locataireId: string): Observable<Contrat[]> {
    return this.http.get<Contrat[]>(`${this.apiUrl}/locataire/${locataireId}/demandes-renouvellement`);
  }

  demanderRenouvellement(contratId: string): Observable<Contrat> {
    const currentUser = this.authService.getCurrentUser();

    if (!currentUser?._id) {
      return new Observable(subscriber => {
        this.authService.fetchCurrentUser().subscribe({
          next: (user) => {
            this.http.post<Contrat>(`${this.apiUrl}/${contratId}/renouvellement`, {
              locataire_id: user._id,
              status_id: '698cd76f79c982fc6c706ac2'
            }).subscribe({
              next: (result) => {
                subscriber.next(result);
                subscriber.complete();
              },
              error: (err) => subscriber.error(err)
            });
          },
          error: (err) => subscriber.error(new Error('Utilisateur non connecté'))
        });
      });
    }

    return this.http.post<Contrat>(`${this.apiUrl}/${contratId}/renouvellement`, {
      locataire_id: currentUser._id,
      status_id: '698cd76f79c982fc6c706ac2' // Statut "EN_ATTENTE_RENOUVELLEMENT"
    });
  }

  /**
   * Approuve une demande de renouvellement (admin)
   */
  approuverRenouvellement(demandeId: string, dates: { date_debut: Date, date_fin: Date }): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${demandeId}/approuver`, dates);
  }

  /**
   * Refuse une demande de renouvellement (admin)
   */
  refuserRenouvellement(demandeId: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${demandeId}/refuser`, {});
  }

  // ==================== ROUTES ADMIN ====================

  /**
   * Récupère toutes les demandes de renouvellement en attente
   */
  getDemandesRenouvellementEnAttente(): Observable<Contrat[]> {
    return this.http.get<Contrat[]>(`${this.apiUrl}/renouvellements/en-attente`);
  }

  /**
   * Récupère toutes les demandes de renouvellement avec pagination
   */
  getToutesDemandesRenouvellement(params?: {
    statut?: string;
    recherche?: string;
    page?: number;
    limit?: number;
  }): Observable<{ demandes: Contrat[], total: number }> {
    let url = `${this.apiUrl}/renouvellements`;
    const queryParams: string[] = [];

    if (params?.statut) queryParams.push(`statut_demande=${params.statut}`);
    if (params?.recherche) queryParams.push(`recherche=${params.recherche}`);
    if (params?.page) queryParams.push(`page=${params.page}`);
    if (params?.limit) queryParams.push(`limit=${params.limit}`);

    if (queryParams.length > 0) {
      url += '?' + queryParams.join('&');
    }

    return this.http.get<{ demandes: Contrat[], total: number }>(url);
  }

  /**
   * Récupère les statistiques des demandes de renouvellement
   */
  getStatsRenouvellements(): Observable<{
    enAttente: number;
    approuvees: number;
    refusees: number;
    ceMois: number;
    total: number;
  }> {
    return this.http.get<any>(`${this.apiUrl}/renouvellements/stats`);
  }

  // ==================== ROUTES UTILITAIRES ====================

  /**
   * Récupère les contrats expirant bientôt
   */
  getContratsExpirationProchaine(jours: number = 30): Observable<Contrat[]> {
    return this.http.get<Contrat[]>(`${this.apiUrl}/expiration/prochaine?jours=${jours}`);
  }

  /**
   * Récupère les contrats expirés
   */
  getContratsExpires(): Observable<Contrat[]> {
    return this.http.get<Contrat[]>(`${this.apiUrl}/expires`);
  }

  /**
   * Récupère les contrats par statut
   */
  getContratsByStatut(statutId: string): Observable<Contrat[]> {
    return this.http.get<Contrat[]>(`${this.apiUrl}/statut/${statutId}`);
  }

  /**
   * Récupère les contrats par magasin
   */
  getContratsByMagasin(magasinId: string): Observable<Contrat[]> {
    return this.http.get<Contrat[]>(`${this.apiUrl}/magasin/${magasinId}`);
  }

  /**
   * Récupère l'historique des renouvellements d'un contrat
   */
  getHistoriqueRenouvellements(contratId: string): Observable<Contrat[]> {
    return this.http.get<Contrat[]>(`${this.apiUrl}/${contratId}/historique-renouvellements`);
  }

  /**
   * Vérifie si un contrat peut être renouvelé
   */
  checkRenouvellementPossible(contratId: string): Observable<{
    possible: boolean;
    raison?: string;
    joursRestants?: number;
  }> {
    return this.http.get<any>(`${this.apiUrl}/${contratId}/check-renouvellement`);
  }

  // ==================== MÉTHODES UTILITAIRES (côté client) ====================

  /**
   * Calcule le nombre de jours restants avant expiration
   */
  calculerJoursRestants(dateFin?: Date): number {
    if (!dateFin) return 0;
    const fin = new Date(dateFin);
    const maintenant = new Date();
    const diff = fin.getTime() - maintenant.getTime();
    return Math.ceil(diff / (1000 * 3600 * 24));
  }

  /**
   * Vérifie si un contrat est expiré
   */
  estExpire(dateFin?: Date): boolean {
    return this.calculerJoursRestants(dateFin) <= 0;
  }

  /**
   * Vérifie si un contrat expire bientôt (dans les X jours)
   */
  expireBientot(dateFin?: Date, seuilJours: number = 30): boolean {
    const jours = this.calculerJoursRestants(dateFin);
    return jours > 0 && jours <= seuilJours;
  }

  /**
   * Calcule la progression du contrat (0-100%)
   */
  calculerProgression(dateDebut?: Date, dateFin?: Date): number {
    if (!dateDebut || !dateFin) return 0;

    const debut = new Date(dateDebut).getTime();
    const fin = new Date(dateFin).getTime();
    const maintenant = new Date().getTime();

    if (maintenant >= fin) return 100;
    if (maintenant <= debut) return 0;

    const total = fin - debut;
    const ecoule = maintenant - debut;
    return (ecoule / total) * 100;
  }

  /**
   * Obtient la couleur du statut pour l'affichage
   */
  getCouleurStatut(contrat: Contrat): string {
    if (this.estExpire(contrat.date_fin)) {
      return '#d32f2f'; // Rouge pour expiré
    }
    if (this.expireBientot(contrat.date_fin)) {
      return '#f57c00'; // Orange pour bientôt expiré
    }
    return contrat.status_id?.couleur || '#7c4dff'; // Couleur par défaut
  }

  /**
   * Formate un contrat pour l'affichage dans une liste
   */
  formatPourListe(contrat: Contrat): any {
    return {
      id: contrat._id,
      reference: contrat.id,
      magasin: contrat.nom_magasin,
      locataire: contrat.locataire_id?.nom,
      dateFin: contrat.date_fin,
      joursRestants: this.calculerJoursRestants(contrat.date_fin),
      statut: contrat.status_id?.nom,
      couleurStatut: contrat.status_id?.couleur,
      urgent: this.expireBientot(contrat.date_fin),
      expire: this.estExpire(contrat.date_fin)
    };
  }
  getContrats(): Observable<any> {
    return this.http.get(this.apiUrl);
  }
  // src/app/services/contrat.service.ts
  getContratsActifs(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/contrat/actifs`);
  }

  getContratActifByUser(userId: string) {
    return this.http.get<any[]>(`${this.apiUrl}/user/${userId}`);
  }
}