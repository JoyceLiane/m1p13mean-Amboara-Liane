import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private isCollapsedSubject = new BehaviorSubject<boolean>(false);
  isCollapsed$ = this.isCollapsedSubject.asObservable();

  constructor() {
    // Charger l'état depuis le localStorage
    const saved = localStorage.getItem('menu-collapsed');
    this.isCollapsedSubject.next(saved === 'true');
  }

  toggle() {
    const newState = !this.isCollapsedSubject.value;
    this.isCollapsedSubject.next(newState);
    localStorage.setItem('menu-collapsed', String(newState));
  }

  setCollapsed(state: boolean) {
    this.isCollapsedSubject.next(state);
    localStorage.setItem('menu-collapsed', String(state));
  }
}