import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { ConnectionProfileService } from '../../services/connection-profile.service';
import { FriendRequest } from '../../models';
import { take, tap } from 'rxjs';
import { User } from '../../../auth/models/user.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-requests-popover',
  templateUrl: './requests-popover.component.html',
  styleUrls: ['./requests-popover.component.scss'],
})
export class RequestsPopoverComponent implements OnInit {
  constructor(
    private readonly popoverController: PopoverController,
    public readonly connectionProfileService: ConnectionProfileService
  ) { }

  ngOnInit() {
    this.connectionProfileService.friendRequests.map(
      (friendRequest: FriendRequest) => {
        const creatorId = (friendRequest as any)?.creator?.id;
        if (friendRequest && creatorId) {
          this.connectionProfileService
            .getConnectionUser(creatorId)
            .pipe(
              take(1),
              tap((user: User) => {
                friendRequest['fullImagePath'] =
                  `${environment.baseApiUrl}/feed/image/${user?.imagePath || 'blank-profile-picture.png'}`;
              })
            )
            .subscribe();
        }
      }
    );
  }

  async respondToFriendRequest(
    id: number,
    statusResponse: 'accepted' | 'declined'
  ) {
    const handledFriendRequest: FriendRequest =
      this.connectionProfileService.friendRequests.find(
        (friendRequest) => friendRequest.id === id
      );

    this.connectionProfileService.friendRequests =
      this.connectionProfileService.friendRequests.filter(
        (friendRequest) => friendRequest.id !== handledFriendRequest.id
      );

    if (this.connectionProfileService?.friendRequests.length === 0) {
      await this.popoverController.dismiss();
    }

    return this.connectionProfileService
      .respondToFriendRequest(id, statusResponse)
      .pipe(take(1))
      .subscribe();
  }
}
