import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../auth/services/auth.service';
import { take } from 'rxjs';
import { Role } from '../../../auth/models/user.model';

type BannerColors = {
  colorOne: string;
  colorTwo: string;
  colorThree: string;
};

@Component({
  selector: 'app-profile-summary',
  templateUrl: './profile-summary.component.html',
  styleUrls: ['./profile-summary.component.scss'],
})
export class ProfileSummaryComponent implements OnInit {
  bannerColors: BannerColors = {
    colorOne: '#a0b4b7',
    colorTwo: '#dbe7e9',
    colorThree: '#bfd3d6',
  };

  constructor(private readonly authService: AuthService) { }

  ngOnInit() {
    this.authService.userRole
      .pipe(
        take(1)
      )
      .subscribe((role: Role) => {
        this.bannerColors = this.getBannerColors(role);
      });
  }

  private getBannerColors(role: Role): BannerColors {
    const roleColors: Record<Role, BannerColors> = {
      admin: {
        colorOne: '#daa520',
        colorTwo: '#f0e68c',
        colorThree: '#fafad2',
      },
      premium: {
        colorOne: '#bc8f8f',
        colorTwo: '#c09999',
        colorThree: '#ddadaf',
      },
      user: {
        colorOne: '#a0b4b7',
        colorTwo: '#dbe7e9',
        colorThree: '#bfd3d6',
      },
    };

    return roleColors[role] || this.bannerColors;
  }
}
