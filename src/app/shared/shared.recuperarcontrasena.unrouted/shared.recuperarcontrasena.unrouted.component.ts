import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../service/auth.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { IProveedor } from '../../model/proveedor.interface';
import { ProveedorService } from '../../service/proveedor.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-shared.recuperarcontrasena.unrouted',
  templateUrl: './shared.recuperarcontrasena.unrouted.component.html',
  styleUrls: ['./shared.recuperarcontrasena.unrouted.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatButtonModule
  ]
})
export class SharedRecuperarContrasenaUnroutedComponent implements OnInit {
  recuperarForm!: FormGroup;
  mensaje: string | null = null;
  error: string | null = null;
  proveedores: IProveedor[] = [];
  isLoading: boolean = false;
  emailRequired: boolean = false; // Para controlar si mostramos el campo de email

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private proveedorService: ProveedorService
  ) {}

  ngOnInit(): void {
    this.recuperarForm = this.fb.group({
      nif: ['', Validators.required],
      proveedorId: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]], // Campo email
    });

    this.recuperarForm.get('nif')?.valueChanges.subscribe(nif => {
      if (nif && nif.trim() !== '') {
        this.buscarProveedoresPorNif(nif.trim());
      } else {
        this.proveedores = [];
        this.recuperarForm.patchValue({ proveedorId: '' });
      }
    });
  }

  buscarProveedoresPorNif(nif: string): void {
    this.proveedorService.getProveedoresPorNif(nif).subscribe({
      next: (proveedores) => {
        this.proveedores = proveedores;
        if (this.proveedores.length === 1) {
          this.recuperarForm.patchValue({ proveedorId: this.proveedores[0].id });
        } else {
          this.recuperarForm.patchValue({ proveedorId: '' });
        }
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error al buscar proveedores', error);
        this.proveedores = [];
        this.recuperarForm.patchValue({ proveedorId: '' });
      }
    });
  }

  onSubmit(): void {
    const nif = this.recuperarForm.value.nif ?? '';
    const proveedorId = this.recuperarForm.value.proveedorId ?? 0;
    const email = this.recuperarForm.value.email ?? '';

    this.isLoading = true; // Activamos el círculo de carga

    this.authService.recuperarPassword({ nif, proveedorId }).subscribe({
      next: (res) => {
        // Si no tiene email, mostramos el campo para agregar uno
        if (res.mensaje && res.mensaje.includes('no tiene email registrado')) {
          this.emailRequired = true;
        } else {
          this.mensaje = res.mensaje;
        }
        this.isLoading = false;
      },
      error: () => {
        this.mensaje = 'Error al intentar enviar el correo de recuperación.';
        this.isLoading = false;
      },
    });
  }

  // Método para guardar el email nuevo
  onSubmitEmail(): void {
    const nif = this.recuperarForm.value.nif ?? '';
    const proveedorId = this.recuperarForm.value.proveedorId ?? 0;
    const email = this.recuperarForm.value.email ?? '';

    this.authService.addEmailToProveedor(proveedorId, email).subscribe({
      next: (res) => {
        this.mensaje = 'Email registrado correctamente. Ahora puedes recuperar la contraseña.';
        this.isLoading = false;
      },
      error: () => {
        this.mensaje = 'Error al registrar el email. Intenta de nuevo.';
        this.isLoading = false;
      },
    });
  }
}