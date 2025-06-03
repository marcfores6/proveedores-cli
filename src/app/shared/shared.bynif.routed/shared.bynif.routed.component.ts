import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ProveedorService } from '../../service/proveedor.service';
import { IProveedor } from '../../model/proveedor.interface';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EntornoService } from '../../service/entorno.service';
import { SessionService } from '../../service/session.service';

declare let bootstrap: any;


@Component({
  selector: 'app-shared.bynif.routed',
  templateUrl: './shared.bynif.routed.component.html',
  styleUrls: ['./shared.bynif.routed.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule]
})
export class SharedBynifRoutedComponent implements OnInit {

  oProveedor: IProveedor = {} as IProveedor;
  newPassword: string = '';
  confirmPassword: string = '';
  passwordChangeMessage: string = '';
  editandoEmail: boolean = false;
  nuevoEmail: string = '';
  mensajeModal: string = '';
  colorModal: 'success' | 'danger' = 'success';
  tituloModal: string = '';
  isDev: boolean = false;


  constructor(private oActivatedRoute: ActivatedRoute, private oProveedorService: ProveedorService, private entornoService: EntornoService, private sessionService: SessionService) { }

  ngOnInit() {
    this.isDev = this.entornoService.getEntorno() === 'dev';
    this.getOne();

    this.entornoService.getEntorno$().subscribe({
      next: () => {
        this.isDev = this.entornoService.getEntorno() === 'dev';
        this.getOne();
      }
    });
  }


  getOne() {
    const proveedorId = this.sessionService.getSessionProveedorId();
    if (!proveedorId) {
      console.error('No se pudo obtener el proveedorId del token.');
      return;
    }

    this.oProveedorService.get(+proveedorId).subscribe({
      next: (oProveedor) => {
        this.oProveedor = oProveedor;
      },
      error: (err) => {
        console.error('Error al obtener proveedor por ID:', err);
      }
    });
  }





  cambiarPassword(): void {
    const validationMessage = this.validatePassword();
    if (validationMessage) {
      this.passwordChangeMessage = validationMessage;
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.passwordChangeMessage = 'Las contraseñas no coinciden.';
      return;
    }

    const params = new URLSearchParams();
    params.set('newPassword', this.newPassword);

    // ✅ Añadir cabecera X-Entorno
    const entorno = this.entornoService.getEntorno();

    fetch(`https://proveedores-back-familycash.onrender.com/proveedor/update-password?${params.toString()}`, {
      method: 'PUT',
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token'),
        'X-Entorno': entorno // 💥 aquí va la clave
      }
    })
      .then(response => response.text())
      .then(data => {
        this.passwordChangeMessage = data;
        this.newPassword = '';
        this.confirmPassword = '';
      })
      .catch(error => {
        console.error(error);
        this.passwordChangeMessage = 'Error al actualizar la contraseña.';
      });
  }



  validatePassword(): string | null {
    const password = this.newPassword;

    if (password.length < 8) {
      return 'La contraseña debe tener al menos 8 caracteres.';
    }
    if (!/[A-Z]/.test(password)) {
      return 'La contraseña debe incluir al menos una letra mayúscula.';
    }
    if (!/[a-z]/.test(password)) {
      return 'La contraseña debe incluir al menos una letra minúscula.';
    }
    if (!/[0-9]/.test(password)) {
      return 'La contraseña debe incluir al menos un número.';
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return 'La contraseña debe incluir al menos un carácter especial.';
    }

    return null; // Sin errores
  }


  activarEdicionEmail() {
    this.nuevoEmail = this.oProveedor.email;
    this.editandoEmail = true;
  }

  cancelarEdicionEmail() {
    this.editandoEmail = false;
  }

  mostrarModalConfirmacion() {
    const modal = new bootstrap.Modal(document.getElementById('modalConfirmarEmail')!);
    modal.show();
  }

  guardarEmail() {
    const emailValido = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(this.nuevoEmail);

    if (!emailValido) {
      this.mensajeModal = 'Introduce un email válido como usuario@dominio.com / .es / .org...';
      this.colorModal = 'danger';
      this.tituloModal = 'Email inválido';
      this.mostrarModalResultado();
      return;
    }

    const params = new URLSearchParams();
    params.set('email', this.nuevoEmail);

    // ✅ Añadir cabecera X-Entorno
    const entorno = this.entornoService.getEntorno();

    fetch(`https://proveedores-back-familycash.onrender.com/proveedor/${this.oProveedor.id}/update-email?${params.toString()}`, {
      method: 'PUT',
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token'),
        'X-Entorno': entorno // 💥 ¡cabecera mágica!
      }
    })
      .then(res => {
        if (!res.ok) throw new Error('Error en la actualización');
        return res.text();
      })
      .then(msg => {
        this.oProveedor.email = this.nuevoEmail;
        this.editandoEmail = false;
        this.mensajeModal = 'Email actualizado correctamente.';
        this.colorModal = 'success';
        this.tituloModal = 'Actualización correcta';
        this.mostrarModalResultado();
      })
      .catch(err => {
        console.error(err);
        this.mensajeModal = 'No se ha podido actualizar el email.';
        this.colorModal = 'danger';
        this.tituloModal = 'Error al actualizar';
        this.mostrarModalResultado();
      });
  }



  mostrarModalResultado() {
    const modal = new bootstrap.Modal(document.getElementById('modalResultadoEmail')!);
    modal.show();
  }


}
