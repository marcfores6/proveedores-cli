import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { IProveedor } from '../../../model/proveedor.interface';
import { ProveedorService } from '../../../service/proveedor.service';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ITipoProveedor } from '../../../model/tipoproveedor.interface';
import { MatDialog } from '@angular/material/dialog';
import { TipoProveedorSelectorComponent } from '../../tipoproveedor/tipoproveedorselector/tipoproveedorselector.component';
import { CryptoService } from '../../../service/crypto.service'; // 👈 Importa el servicio de hash

declare let bootstrap: any;

@Component({
  selector: 'app-proveedor.admin.create.routed',
  templateUrl: './proveedor.admin.create.routed.component.html',
  styleUrls: ['./proveedor.admin.create.routed.component.css'],
  standalone: true,
  imports: [
    RouterModule,
    ReactiveFormsModule,
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ]
})
export class ProveedorAdminCreateRoutedComponent implements OnInit {

  id: number = 0;
  oProveedorForm: FormGroup | undefined = undefined;
  oProveedor: IProveedor | null = null;
  strMessage: string = '';
  imagen: File | null = null;

  readonly dialog = inject(MatDialog);
  oTipoProveedor: ITipoProveedor = {} as ITipoProveedor;
  myModal: any;

  form: FormGroup = new FormGroup({});

  constructor(
    private fb: FormBuilder,
    private oProveedorService: ProveedorService,
    private oRouter: Router,
    private oCryptoService: CryptoService // 👈 Inyectamos CryptoService
  ) {
    this.oProveedorForm = this.fb.group({
      empresa: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50),
      ]),
      email: new FormControl('', [
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$')
      ]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50),
      ]),
      tipoproveedor: new FormGroup({
        id: new FormControl('', Validators.required),
        descripcion: new FormControl(''),
      }),
      imagenUrl: new FormControl('', [Validators.pattern('https?://.+')]), // URL válida (opcional)
      imagen: [null],
    });
  }

  ngOnInit() {
    this.oProveedorForm?.markAllAsTouched();
  }

  onFileSelect(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.imagen = file;
    }
  }

  updateForm() {
    this.oProveedorForm?.controls['empresa'].setValue('');
    this.oProveedorForm?.controls['email'].setValue('');
    this.oProveedorForm?.controls['password'].setValue('');
    this.oProveedorForm?.controls['tipoproveedor'].setValue({
      id: null,
      descripcion: null,
    });
  }

  showModal(mensaje: string) {
    this.strMessage = mensaje;
    this.myModal = new bootstrap.Modal(document.getElementById('mimodal'), {
      keyboard: false,
    });
    this.myModal.show();
  }

  onReset() {
    this.updateForm();
    return false;
  }

  hideModal = () => {
    this.myModal.hide();
    this.oRouter.navigate(['admin/proveedor/view/' + this.oProveedor?.id]);
  };

 onSubmit() {
    if (this.oProveedorForm?.invalid) {
      this.showModal('Formulario inválido');
      return;
    } else {
      const formData = new FormData();
      formData.append('Empresa', this.oProveedorForm?.get('empresa')?.value);
      formData.append('Email', this.oProveedorForm?.get('email')?.value);

      // 🔐 Hashear la contraseña antes de enviarla
      const plainPassword = this.oProveedorForm?.get('password')?.value;
      const hashedPassword = this.oCryptoService.getHashSHA256(plainPassword);
      formData.append('Password', hashedPassword);

      formData.append('TipoProveedor', this.oProveedorForm?.get('tipoproveedor')?.value.id);
      if (this.imagen) {
        formData.append('Imagen', this.imagen);
      }

      this.oProveedorService.create(formData).subscribe({
        next: (oProveedor: IProveedor) => {
          this.oProveedor = oProveedor;
          this.showModal('Proveedor creado con el código: ' + this.oProveedor.id);
        },
        error: (err) => {
          let mensaje = 'Error al crear el Proveedor';
          if (err.status === 400 || err.status === 500) {
            if (err.error?.message) {
              mensaje = err.error.message;
            } else if (typeof err.error === 'string') {
              mensaje = err.error;
            }
          }
          this.showModal(mensaje);
          console.error(err);
        }
      });
    }
  }

  /*  onSubmit() {
      if (this.oProveedorForm?.invalid) {
        this.showModal('Formulario inválido');
        return;
      } else {
        const formData = new FormData();
        formData.append('Empresa', this.oProveedorForm?.get('empresa')?.value);
        formData.append('Email', this.oProveedorForm?.get('email')?.value);
    
        const plainPassword = this.oProveedorForm?.get('password')?.value;
        const hashedPassword = this.oCryptoService.getHashSHA256(plainPassword);
        formData.append('Password', hashedPassword);
    
        formData.append('TipoProveedor', this.oProveedorForm?.get('tipoproveedor')?.value.id);
    
        if (this.imagen) {
          formData.append('Imagen', this.imagen);
        }
    
        const imagenUrl = this.oProveedorForm?.get('imagenUrl')?.value;
        if (imagenUrl) {
          formData.append('ImagenUrl', imagenUrl); // 👈 esto debe estar soportado en el backend
        }
    
        this.oProveedorService.create(formData).subscribe({
          next: (oProveedor: IProveedor) => {
            this.oProveedor = oProveedor;
            this.showModal('Proveedor creado con el código: ' + this.oProveedor.id);
          },
          error: (err) => {
            let mensaje = 'Error al crear el Proveedor';
            if (err.status === 400 || err.status === 500) {
              if (err.error?.message) {
                mensaje = err.error.message;
              } else if (typeof err.error === 'string') {
                mensaje = err.error;
              }
            }
            this.showModal(mensaje);
            console.error(err);
          }
        });
      }
    }
    */

  showTipoProveedorSelectorModal() {
    const dialogRef = this.dialog.open(TipoProveedorSelectorComponent, {
      height: '800px',
      maxHeight: '1200px',
      width: '80%',
      maxWidth: '90%',
      data: { origen: '', idProveedor: '' },
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      if (result !== undefined) {
        console.log(result);
        this.oProveedorForm?.controls['tipoproveedor'].setValue({
          id: result.id,
          descripcion: result.descripcion,
        });
      }
    });
    return false;
  }

}
