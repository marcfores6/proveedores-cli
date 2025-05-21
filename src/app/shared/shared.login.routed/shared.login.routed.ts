import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LoginService } from '../../service/login.service';
import { SessionService } from '../../service/session.service';
import { CryptoService } from '../../service/crypto.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInput, MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';

declare var bootstrap: any; 

@Component({
  selector: 'app-login',
  templateUrl: './shared.login.routed.html',
  styleUrls: ['./shared.login.routed.css'],
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatSelectModule ,
    RouterLink
  ]
})
export class SharedLoginRoutedComponent implements OnInit {

  errorMessage: string | null = null;
  proveedores: any[] = [];
  loginForm: FormGroup = new FormGroup({});
  nifError: string | null = null;


  constructor(
    private oLoginService: LoginService,
    private oSessionService: SessionService,
    private oRouter: Router,
    private oCryptoService: CryptoService
  ) {
    this.loginForm = new FormGroup({
      nif: new FormControl('', [Validators.required]),
      proveedorId: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required])
    });


  }

  ngOnInit(): void {
    this.loginForm.get('nif')?.valueChanges
      .subscribe(nif => {
        if (nif && nif.trim() !== '') {
          this.buscarProveedores();
        } else {
          this.proveedores = [];
          this.loginForm.patchValue({ proveedorId: '' });
        }
      });
  }
  

  buscarProveedores() {
    const nif = this.loginForm.get('nif')?.value;
    if (nif && nif.trim() !== '') {
      this.oLoginService.getProveedoresPorNif(nif).subscribe({
        next: (proveedores) => {
          this.proveedores = proveedores;
  
          if (this.proveedores.length === 0) {
            this.nifError = 'No se encontró ninguna empresa asociada a ese NIF';
          } else {
            this.nifError = null;
            if (this.proveedores.length === 1) {
              this.loginForm.patchValue({ proveedorId: this.proveedores[0].id });
            } else {
              this.loginForm.patchValue({ proveedorId: '' });
            }
          }
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error al buscar proveedores', error);
          this.proveedores = [];
          this.nifError = 'Error al consultar el NIF. Intenta más tarde.';
          this.loginForm.patchValue({ proveedorId: '' });
        }
      });
    } else {
      this.proveedores = [];
      this.nifError = null;
      this.loginForm.patchValue({ proveedorId: '' });
    }
  }
  

  onSubmit() {
    if (this.loginForm.valid) {
      this.oLoginService.login(
        this.loginForm.value.nif,
        this.loginForm.value.password,
        this.loginForm.value.proveedorId
      ).subscribe({
        next: (token: string) => {
          this.errorMessage = null;
  
          const successModal = document.getElementById('successModal');
          if (successModal) {
            const modal = new bootstrap.Modal(successModal);
            modal.show();
          }
  
          this.oSessionService.login(token);
          this.oRouter.navigate(['/producto/xproveedor/plist']);
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error de login:', error);
  
          if (error.status === 401) {
            try {
              const backendError = typeof error.error === 'string' ? JSON.parse(error.error) : error.error;
              this.errorMessage = backendError.message || 'Credenciales incorrectas';
            } catch (e) {
              this.errorMessage = 'Credenciales incorrectas';
            }
          } else {
            this.errorMessage = 'Error de conexión con el servidor. Intenta de nuevo más tarde.';
          }
          
  
          const errorModal = document.getElementById('errorModal');
          if (errorModal) {
            const modal = new bootstrap.Modal(errorModal);
            modal.show();
          }
        }
      });
    }
  }
  
  

  onAdmin() {
    this.loginForm.setValue({
      nif: 'B18975599',
      proveedorId: '',
      password: 'holacaracola'
    });
  }

  onContable() {
    this.loginForm.setValue({
      nif: 'B82451121',
      proveedorId: '',
      password: 'holacaracola'
    });
  }


}