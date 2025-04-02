import {Component, OnInit, ViewChild} from '@angular/core';
import {IonInfiniteScroll} from "@ionic/angular";
import {PostService} from "../../services/post.service";
import {Post} from "../../models";

@Component({
  selector: 'app-all-posts',
  templateUrl: './all-posts.component.html',
  styleUrls: ['./all-posts.component.scss'],
})
export class AllPostsComponent implements OnInit {
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll

  queryParams: string
  allLoadedPosts: Post[] = []
  numberOfPosts = 5
  skipPosts = 0;

  constructor(private postService: PostService) {}

  getPosts(isInitialLoad: boolean, event) {
    if (this.skipPosts === 20) {
      event.target.disabled = true
    }

    this.queryParams = `?take=${this.numberOfPosts}&skip=${this.skipPosts}`

    this.postService.getSelectedPosts(this.queryParams).subscribe(
      (posts: Post[]) => {
        for (let i = 0; i < posts.length; i++) {
          this.allLoadedPosts.push(posts[i])
        }

        if (isInitialLoad) {
          event.target.complete
        }

        this.skipPosts += 5
      },
      (error) => {
        console.log('getPosts error:', error)
      })
  }

  loadData(event) {
    this.getPosts(true, event)
  }

  ngOnInit() {
    this.getPosts(false, null)
  }
}
