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
  proveedores: IProveedor[] = [];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private proveedorService: ProveedorService
  ) {}

  ngOnInit(): void {
    this.recuperarForm = this.fb.group({
      nif: ['', Validators.required],
      proveedorId: ['', Validators.required],
    });

    // 🔁 Escucha cambios en el NIF para filtrar empresas
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

    this.authService.recuperarPassword({ nif, proveedorId }).subscribe({
      next: (res) => {
        this.mensaje = res.mensaje;
      },
      error: () => {
        this.mensaje = 'Error al intentar enviar el correo de recuperación.';
      },
    });
  }
}
