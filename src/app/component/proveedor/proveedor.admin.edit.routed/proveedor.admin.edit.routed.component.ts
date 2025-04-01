import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ProveedorService } from '../../../service/proveedor.service';
import { IProveedor } from '../../../model/proveedor.interface';
import { ITipoProveedor } from '../../../model/tipoproveedor.interface';
import { TipoProveedorSelectorComponent } from '../../tipoproveedor/tipoproveedorselector/tipoproveedorselector.component';
import { CryptoService } from '../../../service/crypto.service';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { SharedLoginRoutedComponent } from '../../../shared/shared.login.routed/shared.login.routed';

declare let bootstrap: any;

@Component({
  selector: 'app-proveedor.admin.edit.routed',
  templateUrl: './proveedor.admin.edit.routed.component.html',
  styleUrls: ['./proveedor.admin.edit.routed.component.css'],
  standalone: true,
  imports:[
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
    RouterModule,
    SharedLoginRoutedComponent
  ]
})
export class ProveedorAdminEditRoutedComponent implements OnInit {
  id: number = 0;
  oProveedorForm!: FormGroup;
  oProveedor: IProveedor | null = null;
  strMessage: string = '';
  myModal: any;

  verPassword: boolean = false;

  imagenesArchivo: File[] = [];
  imagenPreviews: string[] = [];

  oTipoProveedor: ITipoProveedor = {} as ITipoProveedor;

  constructor(
    private oActivatedRoute: ActivatedRoute,
    private oProveedorService: ProveedorService,
    private oRouter: Router,
    private fb: FormBuilder,
    private cryptoService: CryptoService,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.id = this.oActivatedRoute.snapshot.params['id'];
    this.initForm();
    this.cargarProveedor();
  }

  initForm(): void {
    this.oProveedorForm = this.fb.group({
      id: new FormControl(''),
      empresa: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required]),
      tipoproveedor: this.fb.group({
        id: new FormControl('', Validators.required),
        descripcion: new FormControl(''),
      }),
    });
  }

  cargarProveedor(): void {
    this.oProveedorService.getOne(this.id).subscribe({
      next: (proveedor) => {
        this.oProveedor = proveedor;
        this.oProveedorForm.patchValue({
          empresa: proveedor.empresa,
          email: proveedor.email,
          password: proveedor.password, // ❗ opcional: mostrar vacía
          tipoproveedor: proveedor.tipoproveedor || { id: null, descripcion: '' },
        });
      },
      error: (err) => {
        console.error('Error al cargar proveedor', err);
      },
    });
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      for (let i = 0; i < input.files.length; i++) {
        const file = input.files[i];
        this.imagenesArchivo.push(file);

        const reader = new FileReader();
        reader.onload = () => {
          this.imagenPreviews.push(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  }

  eliminarImagen(idImagen: number): void {
    if (!confirm('¿Estás seguro de eliminar esta imagen?')) return;

    this.oProveedorService.deleteImagen(idImagen).subscribe({
      next: () => {
        if (this.oProveedor?.imagenes) {
          this.oProveedor.imagenes = this.oProveedor.imagenes.filter(
            (img) => img.id !== idImagen
          );
        }
      },
      error: (err) => {
        console.error('Error al eliminar imagen', err);
      },
    });
  }

  onSubmit(): void {
    if (this.oProveedorForm.invalid) {
      this.showModal('Formulario inválido');
      return;
    }

    const formData = new FormData();
    formData.append('Empresa', this.oProveedorForm.get('empresa')?.value);
    formData.append('Email', this.oProveedorForm.get('email')?.value);

    const password = this.oProveedorForm.get('password')?.value;
    const hashedPassword = this.cryptoService.getHashSHA256(password);
    formData.append('Password', hashedPassword);

    formData.append(
      'TipoProveedor',
      this.oProveedorForm.get('tipoproveedor.id')?.value
    );

    this.imagenesArchivo.forEach((file) => {
      formData.append('Imagen', file);
    });

    this.oProveedorService.update(this.id, formData).subscribe({
      next: () => {
        this.showModal('Proveedor actualizado correctamente');
      },
      error: (err) => {
        console.error('Error al actualizar', err);
        this.showModal('Error al actualizar el proveedor');
      },
    });
  }

  showModal(msg: string): void {
    this.strMessage = msg;
    this.myModal = new bootstrap.Modal(
      document.getElementById('mimodal') as HTMLElement
    );
    this.myModal.show();
  }

  hideModal = () => {
    this.myModal.hide();
    this.oRouter.navigate(['/admin/proveedor/view', this.id]);
  };

  showTipoProveedorSelectorModal() {
    const dialogRef = this.dialog.open(TipoProveedorSelectorComponent, {
      height: '800px',
      maxHeight: '1200px',
      width: '80%',
      maxWidth: '90%',
      data: { origen: '', idProveedor: '' },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.oProveedorForm?.controls['tipoproveedor'].setValue({
          id: result.id,
          descripcion: result.descripcion,
        });
      }
    });
  }
}
