import { Injectable } from '@angular/core';
import { Socket, SocketIoConfig } from 'ngx-socket-io';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ChatSocketService extends Socket {
  constructor() {
    super(ChatSocketService.createSocketConfig());
  }

  private static createSocketConfig(): SocketIoConfig {
    const token = localStorage.getItem('CapacitorStorage.token');
    return {
      url: environment.socketApiUrl,
      options: {
        transportOptions: {
          polling: {
            extraHeaders: {
              Authorization: token || '',
            },
          },
        },
      },
    };
  }
}
