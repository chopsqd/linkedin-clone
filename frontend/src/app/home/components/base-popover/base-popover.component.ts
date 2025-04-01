import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-base-popover',
  templateUrl: './base-popover.component.html',
  styleUrls: ['./base-popover.component.scss'],
})
export class BasePopoverComponent implements OnInit {
  constructor() {}

  onSignOut() {
    console.log('onSignOut');
  }

  ngOnInit() {}
}
