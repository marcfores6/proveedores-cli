import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthHelperService } from '../service/auth-helper.service';

@Injectable({
  providedIn: 'root'
})
export class AdminOrProveedorGuard implements CanActivate {

  constructor(
    private authHelper: AuthHelperService,
    private router: Router
  ) {}

  canActivate(): boolean {
    if (this.authHelper.isSessionActive() && this.authHelper.isAdminOrProveedor()) {
      return true;
    } else {
      this.router.navigate(['/login']);
      return false;
    }
  }
}
