import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Post } from '../models';
import { environment } from '../../../environments/environment';
import { Observable, take } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private httpOptions: { headers: HttpHeaders } = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(private readonly http: HttpClient) {}

  getSelectedPosts(params): Observable<Post[]> {
    return this.http.get<Post[]>(`${environment.baseApiUrl}/feed${params}`);
  }

  createPost(body: string): Observable<Post> {
    return this.http
      .post<Post>(`${environment.baseApiUrl}/feed`, { body }, this.httpOptions)
      .pipe(take(1));
  }

  updatePost(postId: number, body: string): Observable<Post> {
    return this.http
      .put<Post>(`${environment.baseApiUrl}/feed/${postId}`, { body }, this.httpOptions)
      .pipe(take(1));
  }

  deletePost(postId: number): Observable<Post> {
    return this.http
      .delete<Post>(`${environment.baseApiUrl}/feed/${postId}`)
      .pipe(take(1));
  }
}
