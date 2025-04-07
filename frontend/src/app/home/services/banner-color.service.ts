import { Injectable } from '@angular/core';
import { Role } from '../../auth/models/user.model';

type BannerColors = {
  colorOne: string;
  colorTwo: string;
  colorThree: string;
};

@Injectable({
  providedIn: 'root'
})
export class BannerColorService {
  bannerColors: BannerColors = {
    colorOne: '#a0b4b7',
    colorTwo: '#dbe7e9',
    colorThree: '#bfd3d6',
  };

  getBannerColors(role: Role): BannerColors {
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
