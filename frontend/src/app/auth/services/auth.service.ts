import { Injectable } from '@angular/core';
import { BehaviorSubject, from, map, Observable, take, tap } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Storage } from '@capacitor/storage';
import jwt_decode from 'jwt-decode';
import { NewUser } from '../models/newUser.model';
import { Role, User } from '../models/user.model';
import { UserResponse } from '../models/userResponse.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private user$ = new BehaviorSubject<User>(null);

  private httpOptions: { headers: HttpHeaders } = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router
  ) {}

  get isUserLoggedIn(): Observable<boolean> {
    return this.user$.asObservable().pipe(
      map((user: User) => user !== null)
    );
  }

  get userRole(): Observable<Role | undefined> {
    return this.user$.asObservable().pipe(
      map((user: User | null) => user?.role)
    );
  }

  get userId(): Observable<number> {
    return this.user$.asObservable().pipe(
      map((user: User | null) => user?.id)
    );
  }

  register(newUser: NewUser): Observable<User> {
    return this.http
      .post<User>(
        `${environment.baseApiUrl}/auth/register`,
        newUser,
        this.httpOptions
      )
      .pipe(
        take(1)
      );
  }

  login(email: string, password: string): Observable<{ token: string }> {
    return this.http
      .post<{ token: string }>(
        `${environment.baseApiUrl}/auth/login`,
        { email, password },
        this.httpOptions
      )
      .pipe(
        take(1),
        tap((response: { token: string }) => {
          Storage.set({
            key: 'token',
            value: response.token
          });
          const decodedToken: UserResponse = jwt_decode(response.token);
          this.user$.next(decodedToken.user);
        })
      );
  }

  isTokenInStorage(): Observable<boolean> {
    return from(Storage.get({ key: 'token' })).pipe(
      map((data: { value: string }) => {
        if (!data?.value) {
          return null;
        }

        const decodedToken: UserResponse = jwt_decode(data.value);
        const isExpired = new Date() > new Date(decodedToken.exp * 1000);

        if (isExpired || !decodedToken.user) {
          return null;
        }

        this.user$.next(decodedToken.user);
        return true;
      })
    );
  }

  logout(): void {
    this.user$.next(null);
    Storage.remove({ key: 'token' });
    this.router.navigateByUrl('/auth');
  }
}
