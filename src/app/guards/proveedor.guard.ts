import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { SessionService } from '../service/session.service';

@Injectable({
  providedIn: 'root'
})
export class ProveedorGuard implements CanActivate {

  constructor(
    private sessionService: SessionService,
    private router: Router
  ) {}

  canActivate(): boolean {
    const isActive = this.sessionService.isSessionActive();
    const isProveedor = this.sessionService.getSessionRol() === 'PROVEEDOR';

    if (isActive && isProveedor) {
      return true;
    } else {
      this.router.navigate(['/login']);
      return false;
    }
  }
}
