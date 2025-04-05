import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { from, Observable, switchMap } from 'rxjs';
import { Storage } from '@capacitor/storage';

@Injectable({
  providedIn: 'root'
})
export class AuthInterceptorService implements HttpInterceptor {
  constructor() {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return from(Storage.get({ key: 'token' })).pipe(
      switchMap(({ value: token }) => {
        const updatedRequest = token
          ? req.clone({ headers: req.headers.set('Authorization', `Bearer ${token}`) })
          : req;

        return next.handle(updatedRequest);
      })
    );
  }
}
