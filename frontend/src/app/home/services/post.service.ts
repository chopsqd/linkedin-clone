import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, switchMap, take } from 'rxjs';
import { Post } from '../models';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../auth/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService
  ) {
    this.authService
      .getUserImageName()
      .pipe(
        take(1),
        switchMap(({ imageName }) =>
          this.authService.updateUserImagePath(imageName || 'blank-profile-picture.png')
        )
      )
      .subscribe();
  }

  getSelectedPosts(params): Observable<Post[]> {
    return this.http.get<Post[]>(`${environment.baseApiUrl}/feed${params}`);
  }

  createPost(body: string): Observable<Post> {
    return this.http
      .post<Post>(`${environment.baseApiUrl}/feed`, { body })
      .pipe(take(1));
  }

  updatePost(postId: number, body: string): Observable<Post> {
    return this.http
      .put<Post>(`${environment.baseApiUrl}/feed/${postId}`, { body })
      .pipe(take(1));
  }

  deletePost(postId: number): Observable<Post> {
    return this.http
      .delete<Post>(`${environment.baseApiUrl}/feed/${postId}`)
      .pipe(take(1));
  }
}
