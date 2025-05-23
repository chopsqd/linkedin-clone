import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../../auth/models/user.model';
import { FriendRequest, FriendRequestStatus } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ConnectionProfileService {
  friendRequests: FriendRequest[];

  constructor(private readonly http: HttpClient) {}

  getConnectionUser(id: number): Observable<User> {
    return this.http.get<User>(`${environment.baseApiUrl}/user/${id}`);
  }

  getFriendRequestStatus(id: number): Observable<{ status: FriendRequestStatus }> {
    return this.http.get<{ status: FriendRequestStatus }>(
      `${environment.baseApiUrl}/user/friend-request/status/${id}`
    );
  }

  addConnectionUser(id: number): Observable<FriendRequest | { error: string }> {
    return this.http.post<FriendRequest | { error: string }>(
      `${environment.baseApiUrl}/user/friend-request/send/${id}`,
      {}
    );
  }

  getFriendRequests(): Observable<FriendRequest[]> {
    return this.http.get<FriendRequest[]>(
      `${environment.baseApiUrl}/user/friend-request/me/received-requests`
    );
  }

  respondToFriendRequest(
    id: number,
    statusResponse: 'accepted' | 'declined'
  ): Observable<FriendRequest> {
    return this.http.put<FriendRequest>(
      `${environment.baseApiUrl}/user/friend-request/response/${id}`,
      { status: statusResponse }
    );
  }
}
