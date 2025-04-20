import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePage } from './home.page';
import { ChatComponent, ConnectionProfileComponent, UserProfileComponent } from './components';

const routes: Routes = [
  {
    path: '',
    component: HomePage,
    children: [
      {
        path: '',
        component: UserProfileComponent
      },
      {
        path: ':id',
        component: ConnectionProfileComponent,
      },
      {
        path: 'chat/connections',
        component: ChatComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomePageRoutingModule {
}
