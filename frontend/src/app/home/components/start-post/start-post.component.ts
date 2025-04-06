import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { PostModalComponent } from '../post-modal/post-modal.component';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-start-post',
  templateUrl: './start-post.component.html',
  styleUrls: ['./start-post.component.scss']
})
export class StartPostComponent implements OnInit, OnDestroy {
  @Output() create: EventEmitter<string> = new EventEmitter<string>();

  userFullImagePath: string;
  private userImagePathSubscription: Subscription;

  constructor(
    private readonly modalController: ModalController,
    private readonly authService: AuthService
  ) {}

  async presentModal() {
    console.log('CREATE POST');
    const modal = await this.modalController.create({
      component: PostModalComponent,
      cssClass: 'custom-modal'
    });
    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (!data) {
      return;
    }

    this.create.emit(data.post.body);
  }

  ngOnInit() {
    this.userImagePathSubscription = this.authService.userFullImagePath
      .subscribe((fullPath: string) => {
        this.userFullImagePath = fullPath;
      });
  }

  ngOnDestroy() {
    this.userImagePathSubscription.unsubscribe();
  }
}
