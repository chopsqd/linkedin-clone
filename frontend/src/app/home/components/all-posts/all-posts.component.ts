import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { IonInfiniteScroll, ModalController } from '@ionic/angular';
import { BehaviorSubject, take } from 'rxjs';
import {Post} from '../../models';
import {PostService} from '../../services/post.service';
import { AuthService } from '../../../auth/services/auth.service';
import { PostModalComponent } from '../post-modal/post-modal.component';

@Component({
  selector: 'app-all-posts',
  templateUrl: './all-posts.component.html',
  styleUrls: ['./all-posts.component.scss'],
})
export class AllPostsComponent implements OnInit, OnChanges {
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;
  @Input() postBody?: string;

  queryParams: string;
  allLoadedPosts: Post[] = [];
  numberOfPosts = 5;
  skipPosts = 0;

  userId$ = new BehaviorSubject<number>(null);

  constructor(
    private readonly postService: PostService,
    private readonly authService: AuthService,
    private readonly modalController: ModalController
  ) {}

  getPosts(isInitialLoad: boolean, event) {
    if (this.skipPosts === 20) {
      event.target.disabled = true;
    }

    this.queryParams = `?take=${this.numberOfPosts}&skip=${this.skipPosts}`;

    this.postService.getSelectedPosts(this.queryParams).subscribe(
      (posts: Post[]) => {
        for(const post of posts) {
          this.allLoadedPosts.push(post);
        }

        if(isInitialLoad) {
          event.target.complete();
        }

        this.skipPosts += 5;
      },
      (error) => {
        console.log('getPosts error:', error);
      });
  }

  loadData(event) {
    this.getPosts(true, event);
  }

  async presentUpdateModal(postId: number) {
    const modal = await this.modalController.create({
      component: PostModalComponent,
      cssClass: 'custom-modal',
      componentProps: { postId }
    });
    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (!data) {
      return;
    }

    const newPostBody = data.post.body;
    this.postService.updatePost(postId, newPostBody).subscribe(() => {
      const postIndex = this.allLoadedPosts.findIndex(
        (post: Post) => post.id === postId
      );
      this.allLoadedPosts[postIndex].body = newPostBody;
    });
  }

  deletePost(postId: number) {
    this.postService.deletePost(postId).subscribe(() => {
      this.allLoadedPosts = this.allLoadedPosts.filter(
        (post: Post) => post.id !== postId
      );
    });
  }

  ngOnInit() {
    this.getPosts(false, null);
    this.authService.userId
      .pipe(take(1))
      .subscribe((userId: number) => {
        this.userId$.next(userId);
      });
  }

  ngOnChanges(changes: SimpleChanges) {
    const postBody = changes.postBody.currentValue;
    if (!postBody) {
      return;
    }

    this.postService.createPost(postBody).subscribe((post: Post) => {
      this.allLoadedPosts.unshift(post);
    });
  }
}
