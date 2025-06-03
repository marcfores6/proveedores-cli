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
import { MatIconModule } from '@angular/material/icon';
import { EntornoService } from '../../service/entorno.service';

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
  MatButtonModule,
  MatIconModule
  ]
})
export class SharedRestablecerContrasenaUnroutedComponent implements OnInit {
  form!: FormGroup;
  token!: string;
  mensaje: string | null = null;
  error: string | null = null;
  isLoading: boolean = false;
  hidePassword: boolean = true;
  hideConfirmPassword: boolean = true;
  isDev: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private http: HttpClient,
    private entornoService: EntornoService
  ) { }

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';

    this.entornoService.getEntorno$().subscribe(entorno => {
      this.isDev = entorno === 'dev';
    });

    this.form = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
      email: ['']
    }, {
      validators: this.passwordsIgualesValidator
    });

    this.http.get(`https://proveedores-back-familycash.onrender.com/proveedor/bytoken/${this.token}`).subscribe((res: any) => {
      if (res && !res.email) {
        this.form.controls['email'].setValidators([Validators.required, Validators.email]);
        this.form.controls['email'].updateValueAndValidity();
        this.form.value.emailRequired = true;
      }
    });
  }

  passwordsIgualesValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  onSubmit(): void {
    const newPassword = this.form.value.password;
    const email = this.form.value.email;

    this.isLoading = true;

    this.http.post('https://proveedores-back-familycash.onrender.com/proveedor/restablecer-password', null, {
      params: {
        token: this.token,
        newPassword: newPassword,
        email: email || ''
      }
    }).subscribe({
      next: () => {
        this.mensaje = `Contraseña actualizada correctamente. Tu nueva contraseña es: ${newPassword}`;
        this.error = null;
      },
      error: () => {
        this.mensaje = null;
        this.error = 'No se pudo actualizar la contraseña. Verifica el enlace.';
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
}
