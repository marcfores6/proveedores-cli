import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { SessionService } from '../../service/session.service';
import { CommonModule } from '@angular/common';
import { ProveedorService } from '../../service/proveedor.service';
import { AuthHelperService } from '../../service/auth-helper.service'; // 👈 Importa tu helper
import { EntornoService } from '../../service/entorno.service';


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
  entorno!: 'dev' | 'prod';
  isDev: boolean = false;
  logoUrl: string = 'assets/img/supermercados-family-cash.png';



  constructor(
    private oRouter: Router,
    private oSessionService: SessionService,
    private oProveedorService: ProveedorService,
    private oAuthHelper: AuthHelperService,
    private entornoService: EntornoService
  ) {
    this.oRouter.events.subscribe((oEvent) => {
      this.entorno = this.entornoService.getEntorno();
      if (oEvent instanceof NavigationEnd) {
        this.strRuta = oEvent.url;
      }
    });

    this.initializeSession();
  }

  ngOnInit() {
    this.oSessionService.onLogin().subscribe({
      next: () => this.initializeSession()
    });

    this.oSessionService.onLogout().subscribe({
      next: () => {
        this.activeSession = false;
        this.userNif = '';
        this.proveedorDescripcion = '';
        this.isAdmin = false;
        this.isProveedor = false;
      }
    });
    this.entornoService.getEntorno$().subscribe({
      next: (nuevoEntorno) => {
        this.entorno = nuevoEntorno;
        this.isDev = this.entorno === 'dev';
        this.logoUrl = this.isDev
          ? 'assets/img/cash&carry.png'  // 🔁 Tu logo de entorno desarrollo
          : 'assets/img/supermercados-family-cash.png';
        this.initializeSession(); // recarga proveedor tras cambiar entorno
      }
    });

  }


  initializeSession(): void {
  this.activeSession = this.oSessionService.isSessionActive();
  this.userNif = this.oSessionService.getSessionNif();
  this.isAdmin = this.oAuthHelper.isAdmin();
  this.isProveedor = this.oAuthHelper.isProveedor();

  const proveedorId = this.oSessionService.getSessionProveedorId();
  if (proveedorId) {
    this.oProveedorService.get(+proveedorId).subscribe({
      next: (proveedor) => {
        this.proveedorDescripcion = proveedor.descripcion || 'Proveedor';
      },
      error: (err) => {
        console.error('Error al cargar proveedor por ID', err);
        this.proveedorDescripcion = 'Proveedor';
      }
    });
  } else {
    this.proveedorDescripcion = 'Proveedor';
  }
}

  onChangeEntorno(event: any) {
    const nuevoEntorno = event.target.value as 'dev' | 'prod';
    this.entornoService.setEntorno(nuevoEntorno);
  }


}
