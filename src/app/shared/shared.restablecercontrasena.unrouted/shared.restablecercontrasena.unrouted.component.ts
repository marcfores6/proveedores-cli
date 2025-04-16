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

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';
    this.form = this.fb.group({
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    const newPassword = this.form.value.password;

    this.http.post('http://localhost:8086/proveedor/restablecer-password', {
      token: this.token,
      newPassword: newPassword
    }).subscribe({
      next: () => {
        this.mensaje = 'Contraseña actualizada correctamente. Ya puedes iniciar sesión.';
        this.error = null;
      },
      error: () => {
        this.error = 'No se pudo actualizar la contraseña. Verifica el enlace.';
        this.mensaje = null;
      }
    });
    
  }
}
