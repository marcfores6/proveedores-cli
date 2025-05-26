import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { EntornoService } from '../../service/entorno.service';

@Component({
  selector: 'app-shared.home.routed',
  templateUrl: './shared.home.routed.component.html',
  styleUrls: ['./shared.home.routed.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ]

})
export class SharedHomeRoutedComponent implements OnInit {

  isLoggedIn: boolean = false;
  isDev: boolean = false;
  logoUrl: string = 'assets/img/supermercados-family-cash.png';
  nombreEmpresa: string = 'Family Cash';
  message: string = '';
  myModal: any;


  constructor(private router: Router, private entornoService: EntornoService) { }

  ngOnInit() {
    const token = localStorage.getItem('token');
    this.isLoggedIn = !!token;

    this.setEntorno(this.entornoService.getEntorno());
    this.entornoService.getEntorno$().subscribe({
      next: (entorno) => this.setEntorno(entorno)
    });
  }

  private setEntorno(entorno: 'dev' | 'prod') {
    this.isDev = entorno === 'dev';

    if (this.isDev) {
      this.logoUrl = 'assets/img/cash&carry.png';
      this.nombreEmpresa = 'Cash&Carry';
    } else {
      this.logoUrl = 'assets/img/supermercados-family-cash.png';
      this.nombreEmpresa = 'Family Cash';
    }
  }

  showModal(message: string) {
    this.message = message;
    const modal = new (window as any).bootstrap.Modal(
      document.getElementById('mimodal'),
      {}
    );
    modal.show();
  }

  hideModal = () => {
    this.myModal?.hide();
  };


  private getNifFromToken(): string | null {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.nif || null;
    } catch (e) {
      console.error('Error al decodificar el token:', e);
      return null;
    }
  }



  irAProveedores() {
    const nif = this.getNifFromToken();
    if (nif) {
      this.router.navigate([`/bynif/${nif}`]);
    } else {
      this.showModal('No se ha podido obtener el NIF del token. Inicia sesión de nuevo.');
    }
  }



}
