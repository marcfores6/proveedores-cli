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
import { CryptoService } from '../../../service/crypto.service';

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
  imagenesArchivo: File[] = [];
  imagenPreviews: string[] = [];
  imagenesUrl: string[] = [];
  imagenUrlControl = new FormControl('', [Validators.pattern('https?://.+')]);

  readonly dialog = inject(MatDialog);
  oTipoProveedor: ITipoProveedor = {} as ITipoProveedor;
  myModal: any;

  constructor(
    private fb: FormBuilder,
    private oProveedorService: ProveedorService,
    private oRouter: Router,
    private oCryptoService: CryptoService
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
      })
    });
  }

  ngOnInit() {
    this.oProveedorForm?.markAllAsTouched();
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      Array.from(input.files).forEach(file => {
        this.imagenesArchivo.push(file);

        const reader = new FileReader();
        reader.onload = () => {
          this.imagenPreviews.push(reader.result as string);
        };
        reader.readAsDataURL(file);
      });
    }
  }

  agregarImagenUrl(): void {
    const url = this.imagenUrlControl.value;
    if (url && !this.imagenesUrl.includes(url)) {
      this.imagenesUrl.push(url);
      this.imagenUrlControl.setValue('');
    }
  }

  updateForm() {
    this.oProveedorForm?.reset();
    this.imagenesArchivo = [];
    this.imagenesUrl = [];
    this.imagenPreviews = [];
    this.imagenUrlControl.setValue('');
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
      this.showModal('Formulario inválido');
      return;
    }

    const formData = new FormData();
    formData.append('Empresa', this.oProveedorForm?.get('empresa')?.value);
    formData.append('Email', this.oProveedorForm?.get('email')?.value);

    const plainPassword = this.oProveedorForm?.get('password')?.value;
    const hashedPassword = this.oCryptoService.getHashSHA256(plainPassword);
    formData.append('Password', hashedPassword);

    formData.append('TipoProveedor', this.oProveedorForm?.get('tipoproveedor')?.value.id);

    this.imagenesArchivo.forEach(file => {
      formData.append('Imagen', file);
    });

    this.imagenesUrl.forEach(url => {
      formData.append('ImagenUrl', url);
    });

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

  showTipoProveedorSelectorModal() {
    const dialogRef = this.dialog.open(TipoProveedorSelectorComponent, {
      height: '800px',
      maxHeight: '1200px',
      width: '80%',
      maxWidth: '90%',
      data: { origen: '', idProveedor: '' },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        this.oProveedorForm?.controls['tipoproveedor'].setValue({
          id: result.id,
          descripcion: result.descripcion,
        });
      }
    });
    return false;
  }
}
