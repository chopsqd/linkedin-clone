import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Post} from '../models';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  constructor(private http: HttpClient) { }

  getSelectedPosts(params) {
    return this.http.get<Post[]>('https://jsonplaceholder.typicode.com/posts?_start=1&_limit=5' + params);
  }
}
