import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // ✅ Attacher le token à chaque requête si disponible
    const token = localStorage.getItem('token');

    const authReq = token
      ? req.clone({
          setHeaders: { Authorization: `Bearer ${token}` }
        })
      : req;

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          const message = error.error?.error || '';

          const isTokenInvalid =
            message === 'Token invalide' ||
            message === 'Token manquant';

          if (isTokenInvalid) {
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            localStorage.removeItem('user');

            alert('Votre session a expiré. Veuillez vous reconnecter.');
            this.router.navigate(['/login']);
          }
        }

        return throwError(() => error);
      })
    );
  }
}