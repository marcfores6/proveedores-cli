import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ProveedorService } from '../../service/proveedor.service';
import { IProveedor } from '../../model/proveedor.interface';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-shared.bynif.routed',
  templateUrl: './shared.bynif.routed.component.html',
  styleUrls: ['./shared.bynif.routed.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule]
})
export class SharedBynifRoutedComponent implements OnInit {

  id: number = 0;
  nif: string = '';
  oProveedor: IProveedor = {} as IProveedor;
  newPassword: string = '';
  confirmPassword: string = '';
  passwordChangeMessage: string = '';

  constructor(private oActivatedRoute: ActivatedRoute, private oProveedorService: ProveedorService) { }

  ngOnInit() {
    this.nif = this.oActivatedRoute.snapshot.params['nif'];
    this.getOne();
  }

  getOne() {
    this.oProveedorService.getProveedorFromToken().subscribe({
      next: (oProveedor) => {
        this.oProveedor = oProveedor;
      },
      error: (err) => {
        console.log(err);
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
  
    fetch(`http://localhost:8086/proveedor/update-password?${params.toString()}`, {
      method: 'PUT',
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token')
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
  

}
