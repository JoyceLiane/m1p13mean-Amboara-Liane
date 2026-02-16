import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http'; // ← Ajoutez HttpHeaders
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Menu {
  _id: string;
  title: string;
  icon: string;
  route: string;
  orderIndex: number;
  parent: string | null;
  roles: string[];
  children?: Menu[];
}

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private apiUrl = `${environment.apiUrl}/menus`;
  private menusSubject = new BehaviorSubject<Menu[]>([]);
  menus$ = this.menusSubject.asObservable();
  
  private collapsedSubject = new BehaviorSubject<boolean>(false);
  isCollapsed$ = this.collapsedSubject.asObservable();

  constructor(private http: HttpClient) {
    const savedState = localStorage.getItem('menuCollapsed');
    if (savedState) {
      this.collapsedSubject.next(savedState === 'true');
    }
  }

  // 🔑 Fonction helper pour créer les headers avec le token
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    console.log('🔑 Token récupéré:', token ? 'Présent' : 'Absent');
    
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // Charger les menus pour l'utilisateur connecté
  getUserMenus(): Observable<Menu[]> {
    console.log('📡 Appel API: GET /menus/user');
    
    return this.http.get<Menu[]>(`${this.apiUrl}/user`, {
      headers: this.getHeaders()  // ← Ajout du token ici
    }).pipe(
      tap(menus => {
        console.log('✅ Menus reçus:', menus);
        this.menusSubject.next(menus);
      })
    );
  }

  // Charger tous les menus (pour admin)
  getAllMenus(): Observable<Menu[]> {
    return this.http.get<Menu[]>(this.apiUrl, {
      headers: this.getHeaders()  // ← Ajout du token ici
    });
  }

  // Rafraîchir le menu
  refreshMenu(): void {
    console.log('🔄 Rafraîchissement du menu');
    this.getUserMenus().subscribe({
      next: (menus) => console.log('✅ Menu rafraîchi:', menus),
      error: (err) => console.error('❌ Erreur refreshMenu:', err)
    });
  }

  // CRUD operations
  createMenu(menu: Partial<Menu>): Observable<Menu> {
    return this.http.post<Menu>(this.apiUrl, menu, {
      headers: this.getHeaders()
    });
  }

  updateMenu(id: string, menu: Partial<Menu>): Observable<Menu> {
    return this.http.put<Menu>(`${this.apiUrl}/${id}`, menu, {
      headers: this.getHeaders()
    });
  }

  deleteMenu(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    });
  }

  assignRoles(id: string, roles: string[]): Observable<Menu> {
    return this.http.put<Menu>(`${this.apiUrl}/${id}/roles`, { roles }, {
      headers: this.getHeaders()
    });
  }

  // Gestion du collapse
  toggleCollapse(): void {
    const current = this.collapsedSubject.value;
    const newState = !current;
    this.collapsedSubject.next(newState);
    localStorage.setItem('menuCollapsed', String(newState));
  }

  setCollapsed(state: boolean): void {
    this.collapsedSubject.next(state);
    localStorage.setItem('menuCollapsed', String(state));
  }

  clearMenu(): void {
    this.menusSubject.next([]);
  }
}