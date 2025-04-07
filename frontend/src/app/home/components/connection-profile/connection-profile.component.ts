import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map, Observable, Subscription, switchMap, take, tap } from 'rxjs';
import { BannerColorService } from '../../services/banner-color.service';
import { FriendRequestStatus } from '../../models';
import { User } from '../../../auth/models/user.model';
import { ConnectionProfileService } from '../../services/connection-profile.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-connection-profile',
  templateUrl: './connection-profile.component.html',
  styleUrls: ['./connection-profile.component.scss']
})
export class ConnectionProfileComponent implements OnInit, OnDestroy {
  user: User;
  friendRequestStatus: FriendRequestStatus;
  private subscriptions: Subscription[] = [];

  constructor(
    public bannerColorService: BannerColorService,
    private route: ActivatedRoute,
    private connectionProfileService: ConnectionProfileService
  ) {}

  ngOnInit(): void {
    this.subscriptions.push(
      this.getFriendRequestStatus()
        .pipe(
          tap(({ status }: { status: FriendRequestStatus }) => {
            this.friendRequestStatus = status;
          }),
          switchMap(() => this.getUser())
        )
        .subscribe((user: User) => {
          this.user = { ... user, imagePath: this.getImagePath(user.imagePath)};
        })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  addUser(): void {
    this.friendRequestStatus = 'pending';
    this.subscriptions.push(
      this.getUserIdFromUrl()
        .pipe(
          switchMap((userId: number) =>
            this.connectionProfileService.addConnectionUser(userId)
          ),
          take(1)
        )
        .subscribe()
    );
  }

  private getUser(): Observable<User> {
    return this.getUserIdFromUrl().pipe(
      switchMap((userId: number) =>
        this.connectionProfileService.getConnectionUser(userId)
      )
    );
  }

  private getFriendRequestStatus(): Observable<{ status: FriendRequestStatus }> {
    return this.getUserIdFromUrl().pipe(
      switchMap((userId: number) =>
        this.connectionProfileService.getFriendRequestStatus(userId)
      )
    );
  }

  private getUserIdFromUrl(): Observable<number> {
    return this.route.url.pipe(
      map((urlSegment) => +urlSegment[0].path)
    );
  }

  private getImagePath(imageName: string): string {
    return `${environment.baseApiUrl}/feed/image/${imageName ?? 'blank-profile-picture.png'}`;
  }
}
