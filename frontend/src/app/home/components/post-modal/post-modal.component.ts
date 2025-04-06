import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {NgForm} from '@angular/forms';
import {ModalController} from '@ionic/angular';
import { BehaviorSubject, Subscription, take } from 'rxjs';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-post-modal',
  templateUrl: './post-modal.component.html',
  styleUrls: ['./post-modal.component.scss'],
})
export class PostModalComponent implements OnInit, OnDestroy {
  @ViewChild('form') form: NgForm;
  @Input() postId?: number;

  fullName$ = new BehaviorSubject<string>(null);
  fullName = '';

  userFullImagePath: string;
  private userImagePathSubscription: Subscription;

  constructor(
    private readonly modalController: ModalController,
    private readonly authService: AuthService
  ) {}

  async onDismiss() {
    await this.modalController.dismiss(null, 'dismiss');
  }

  onPost() {
    if (!this.form.valid) {
      return;
    }

    const body = this.form.value.body;
    this.modalController.dismiss({ post: { body } }, 'post');
  }

  ngOnInit() {
    this.authService.userFullName
      .pipe(take(1))
      .subscribe((fullName: string) => {
        this.fullName = fullName;
        this.fullName$.next(fullName);
      });

    this.userImagePathSubscription = this.authService.userFullImagePath
      .subscribe((fullPath: string) => {
        this.userFullImagePath = fullPath;
      });
  }

  ngOnDestroy() {
    this.userImagePathSubscription.unsubscribe();
  }
}
