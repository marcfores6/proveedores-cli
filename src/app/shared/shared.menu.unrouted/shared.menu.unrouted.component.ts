import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { SessionService } from '../../service/session.service';
import { CommonModule } from '@angular/common';
import { ProveedorService } from '../../service/proveedor.service';
import { AuthHelperService } from '../../service/auth-helper.service'; // 👈 Importa tu helper

@Component({
  selector: 'app-shared-menu-unrouted',
  templateUrl: './shared.menu.unrouted.component.html',
  styleUrls: ['./shared.menu.unrouted.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule],
})
export class SharedMenuUnroutedComponent implements OnInit {

  strRuta: string = '';
  activeSession: boolean = false;
  userNif: string = '';
  proveedorDescripcion: string = '';
  isAdmin: boolean = false;
  isProveedor: boolean = false;

  constructor(
    private oRouter: Router,
    private oSessionService: SessionService,
    private oProveedorService: ProveedorService,
    private oAuthHelper: AuthHelperService // 👈 Inyectamos helper
  ) {
    this.oRouter.events.subscribe((oEvent) => {
      if (oEvent instanceof NavigationEnd) {
        this.strRuta = oEvent.url;
      }
    });

    this.initializeSession();
  }

  ngOnInit() {
    this.oSessionService.onLogin().subscribe({
      next: () => {
        this.initializeSession();
      },
    });
    this.oSessionService.onLogout().subscribe({
      next: () => {
        this.activeSession = false;
        this.userNif = '';
        this.proveedorDescripcion = '';
        this.isAdmin = false;
        this.isProveedor = false;
      },
    });
  }

  initializeSession(): void {
    this.activeSession = this.oSessionService.isSessionActive();
    this.userNif = this.oSessionService.getSessionNif();

    this.isAdmin = this.oAuthHelper.isAdmin();
    this.isProveedor = this.oAuthHelper.isProveedor();

    const proveedorId = this.oSessionService.getSessionProveedorId();
    this.cargarProveedorDescripcion(proveedorId);
  }

  cargarProveedorDescripcion(proveedorDescripcion: string): void {
    const idNumerico = Number(proveedorDescripcion);

    if (!idNumerico) return;

    this.oProveedorService.get(idNumerico).subscribe({
      next: (proveedor) => {
        this.proveedorDescripcion = proveedor.descripcion || 'Proveedor';
      },
      error: (err) => {
        console.error('Error al cargar proveedor', err);
        this.proveedorDescripcion = 'Proveedor';
      }
    });
  }
}
