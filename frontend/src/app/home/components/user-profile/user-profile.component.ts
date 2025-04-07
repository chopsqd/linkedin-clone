import { Component } from "@angular/core";

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss'],
})
export class UserProfileComponent {
  body = '';

  onCreatePost(body: string) {
    this.body = body;
  }
}
