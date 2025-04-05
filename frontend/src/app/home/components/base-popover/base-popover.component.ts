import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-base-popover',
  templateUrl: './base-popover.component.html',
  styleUrls: ['./base-popover.component.scss'],
})
export class BasePopoverComponent implements OnInit {
  constructor(private readonly authService: AuthService) {}

  onSignOut() {
    this.authService.logout();
  }

  ngOnInit() {}
}
