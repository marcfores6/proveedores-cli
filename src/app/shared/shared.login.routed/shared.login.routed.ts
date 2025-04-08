import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginService } from '../../service/login.service';
import { SessionService } from '../../service/session.service';
import { CryptoService } from '../../service/crypto.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInput, MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

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
    MatSelectModule 
  ]
})
export class SharedLoginRoutedComponent implements OnInit {

  errorMessage: string | null = null;
  proveedores: any[] = [];
  loginForm: FormGroup = new FormGroup({});

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
      .pipe(
        debounceTime(300), // Espera 300 ms después de que el usuario deje de escribir
        distinctUntilChanged() // Solo si el valor cambia
      )
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
          // Si solo hay un proveedor, lo seleccionamos automáticamente
          if (this.proveedores.length === 1) {
            this.loginForm.patchValue({ proveedorId: this.proveedores[0].id });
          } else {
            this.loginForm.patchValue({ proveedorId: '' });
          }
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error al buscar proveedores', error);
          this.proveedores = [];
          this.loginForm.patchValue({ proveedorId: '' });
        }
      });
    } else {
      this.proveedores = [];
      this.loginForm.patchValue({ proveedorId: '' });
    }
  }
  

  onSubmit() {
    if (this.loginForm.valid) {
      //const hashedPassword = this.oCryptoService.getHashSHA256(this.loginForm.value.password);
      this.oLoginService.login(this.loginForm.value.nif, this.loginForm.value.password, this.loginForm.value.proveedorId).subscribe({
        next: (token: string) => {
          console.log('Token recibido:', token);
          alert('Inicio de sesión exitoso');

          this.oSessionService.login(token);
          this.oRouter.navigate(['/admin/producto/xproveedor/plist']);

          //let parsedToken: IJwt;
          //parsedToken = this.oSessionService.parseJwt(token);
          //console.log('Token parseado:', parsedToken);
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error al realizar la solicitud', error);
          alert('NIF, proveedor o contraseña incorrectos');
          this.errorMessage = 'NIF, proveedor o contraseña incorrectos';
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
      nif: 'emailRafa2149@gmail.com',
      password: 'ausias'
    });
  }


}