import { Component, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, Subscription, take } from "rxjs";
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-base-popover',
  templateUrl: './base-popover.component.html',
  styleUrls: ['./base-popover.component.scss'],
})
export class BasePopoverComponent implements OnInit, OnDestroy {
  fullName$ = new BehaviorSubject<string>(null);
  fullName = '';

  userFullImagePath: string;
  private userImagePathSubscription: Subscription;

  constructor(private readonly authService: AuthService) {}

  onSignOut() {
    this.authService.logout();
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
