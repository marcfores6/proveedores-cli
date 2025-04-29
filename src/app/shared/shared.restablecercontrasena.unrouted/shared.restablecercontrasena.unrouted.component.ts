import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-shared.restablecercontrasena.unrouted',
  templateUrl: './shared.restablecercontrasena.unrouted.component.html',
  styleUrls: ['./shared.restablecercontrasena.unrouted.component.css'],
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
export class SharedRestablecerContrasenaUnroutedComponent implements OnInit {
  form!: FormGroup;
  token!: string;
  mensaje: string | null = null;
  error: string | null = null;
  isLoading: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';
    this.form = this.fb.group({
      password: ['', Validators.required],
      email: ['']
    });

    // Verificar si es necesario ingresar un email
    this.http.get(`http://localhost:8086/proveedor/bytoken/${this.token}`).subscribe((res: any) => {
      if (res && !res.email) {
        this.form.controls['email'].setValidators([Validators.required, Validators.email]);
        this.form.controls['email'].updateValueAndValidity();
        this.form.value.emailRequired = true; // Activar campo de email
      }
    });
  }

  onSubmit(): void {
    const newPassword = this.form.value.password;
    const email = this.form.value.email;
  
    this.isLoading = true; // Mostrar el círculo de carga
  
    this.http.post('http://localhost:8086/proveedor/restablecer-password', null, {
      params: {
        token: this.token,
        newPassword: newPassword,
        email: email || ''
      }
    }).subscribe({
      next: () => {
        const passwordMostrada = this.form.value.password;
        this.mensaje = `Contraseña actualizada correctamente. Tu nueva contraseña es: ${passwordMostrada}`;
        this.error = null; // Muy importante: limpiar error
      },
      error: () => {
        this.mensaje = null; // Muy importante: limpiar mensaje
        this.error = 'No se pudo actualizar la contraseña. Verifica el enlace.';
      },
      complete: () => {
        this.isLoading = false; // Solo apagar loading aquí
      }
    });
  }
  
}