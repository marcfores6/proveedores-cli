import { Injectable } from '@angular/core';
import { SessionService } from './session.service';

@Injectable({
  providedIn: 'root'
})
export class AuthHelperService {

  constructor(private sessionService: SessionService) { }

  isAdmin(): boolean {
    return this.sessionService.getSessionRol() === 'ADMINISTRADOR';
  }

  isProveedor(): boolean {
    return this.sessionService.getSessionRol() === 'PROVEEDOR';
  }

  isSessionActive(): boolean {
    return this.sessionService.isSessionActive();
  }

  isAdminOrProveedor(): boolean {
    const rol = this.sessionService.getSessionRol();
    return rol === 'ADMINISTRADOR' || rol === 'PROVEEDOR';
  }
}
