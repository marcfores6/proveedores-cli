import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { SessionService } from '../../service/session.service';
import { CommonModule } from '@angular/common';
import { ProveedorService } from '../../service/proveedor.service'; // <- Importa tu servicio de proveedor

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

  constructor(
    private oRouter: Router,
    private oSessionService: SessionService,
    private oProveedorService: ProveedorService // <- Inyecta el servicio de proveedor
  ) {
    this.oRouter.events.subscribe((oEvent) => {
      if (oEvent instanceof NavigationEnd) {
        this.strRuta = oEvent.url;
      }
    });
    this.activeSession = this.oSessionService.isSessionActive();
    if (this.activeSession) {
      this.userNif = this.oSessionService.getSessionNif();
      const proveedorId = this.oSessionService.getSessionProveedorId();
      this.cargarProveedorDescripcion(proveedorId);

    }
  }

  ngOnInit() {
    this.oSessionService.onLogin().subscribe({
      next: () => {
        this.activeSession = true;
        this.userNif = this.oSessionService.getSessionNif();
        const proveedorId = this.oSessionService.getSessionProveedorId();
        this.cargarProveedorDescripcion(proveedorId);


      },
    });
    this.oSessionService.onLogout().subscribe({
      next: () => {
        this.activeSession = false;
        this.userNif = '';
        this.proveedorDescripcion = ''; // <- Limpiamos la descripción
      },
    });
  }

  cargarProveedorDescripcion(proveedorDescripcion: string): void {
    const idNumerico = Number(proveedorDescripcion); // 👈 Convertimos a número

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
