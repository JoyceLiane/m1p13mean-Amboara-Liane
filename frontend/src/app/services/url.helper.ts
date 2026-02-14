// src/app/services/url.helper.ts
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UrlHelper {
  
  getProfilUrl(path: string | null | undefined): string {
    if (!path) return `${environment.uploadsUrl}/profils/default-avatar.png`;
    
    // Si le path commence déjà par http, le retourner tel quel
    if (path.startsWith('http')) return path;
    
    // Sinon, construire l'URL complète
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    return `${environment.uploadsUrl}/profils/${cleanPath}`;
  }

  getProductImageUrl(imagepath: string | null | undefined): string {
    if (!imagepath) return `${environment.uploadsUrl}/produits/default-product.png`;
    const cleanPath = imagepath.startsWith('/') ? imagepath.substring(1) : imagepath;
    return `${environment.uploadsUrl}/produits/${cleanPath}`;
  }

  getMagasinImageUrl(imagepath: string | null | undefined): string {
    if (!imagepath) return `${environment.uploadsUrl}/magasins/default-magasin.png`;
    const cleanPath = imagepath.startsWith('/') ? imagepath.substring(1) : imagepath;
    return `${environment.uploadsUrl}/magasins/${cleanPath}`;
  }
}