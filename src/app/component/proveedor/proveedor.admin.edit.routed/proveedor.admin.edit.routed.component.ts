import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { IProveedor } from '../../../model/proveedor.interface';
import { ProveedorService } from '../../../service/proveedor.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog } from '@angular/material/dialog';
import { ITipoProveedor } from '../../../model/tipoproveedor.interface';
import { TipoProveedorSelectorComponent } from '../../tipoproveedor/tipoproveedorselector/tipoproveedorselector.component';
import { CryptoService } from '../../../service/crypto.service'; // 👈 Hasher importado

declare let bootstrap: any;

@Component({
  selector: 'app-proveedor.admin.edit.routed',
  templateUrl: './proveedor.admin.edit.routed.component.html',
  styleUrls: ['./proveedor.admin.edit.routed.component.css'],
  standalone: true,
  imports: [RouterModule, ReactiveFormsModule, CommonModule, MatFormFieldModule, MatInputModule, MatSelectModule],
})
export class ProveedorAdminEditRoutedComponent implements OnInit {

  id: number = 0;
  oProveedorForm: FormGroup | undefined = undefined;
  oProveedor: IProveedor | null = null;
  imagen: string | null = null;
  nuevaImagen: File | null = null;
  imagenPreview: string | null = null; // Para la vista previa de la imagen
  strMessage: string = '';
  myModal: any;

  originalPassword: string = ''; // 👈 Aquí guardamos la original
  readonly dialog = inject(MatDialog);
  oTipoProveedor: ITipoProveedor = {} as ITipoProveedor;

  constructor(
    private oActivatedRoute: ActivatedRoute,
    private oProveedorService: ProveedorService,
    private oRouter: Router,
    private fb: FormBuilder,
    private oCryptoService: CryptoService // 👈 Inyectado
  ) {}

  ngOnInit() {
    this.id = this.oActivatedRoute.snapshot.params['id'];
    this.oProveedorForm = this.fb.group({
      id: ['', [Validators.required]],
      empresa: ['', [Validators.required]],
      email: ['', [Validators.required]],
      password: ['', [Validators.required]],
      tipoproveedor: new FormGroup({
        id: new FormControl('', Validators.required),
        descripcion: new FormControl(''),
      }),
      imagenUrl: new FormControl('', [
        Validators.pattern('^(https?:\\/\\/|\\/).+')
      ]),      
    });
    this.cargarProducto();
  }

  cargarProducto(): void {
    this.oProveedorService.get(this.id).subscribe({
      next: (data: IProveedor) => {
        this.oProveedor = data;
        this.originalPassword = data.password;
  
        this.oProveedorForm?.patchValue({
          id: data.id,
          empresa: data.empresa,
          email: data.email,
          password: data.password,
          tipoproveedor: data.tipoproveedor
            ? {
                id: data.tipoproveedor.id,
                descripcion: data.tipoproveedor.descripcion,
              }
            : {
                id: null,
                descripcion: '',
              },
          imagenUrl: data.imagenUrl ?? '',
        });
  
        // 👉 Mostrar imagen desde URL si existe
        if (data.imagenUrl && data.imagenUrl.trim() !== '') {
          // Aseguramos que la imagen se cargue con el dominio del backend
          this.imagen = 'http://localhost:8086' + data.imagenUrl;
        } else {
          this.cargarImagen(); // imagen binaria
        }
      },
      error: (error) => {
        console.error(error);
      },
    });
  }
  
  

  cargarImagen(): void {
    this.oProveedorService.getImagen(this.id).subscribe({
      next: (blob: Blob) => {
        const reader = new FileReader();
        reader.onload = () => {
          this.imagen = reader.result as string;
        };
        reader.readAsDataURL(blob);
      },
      error: () => {
        this.imagen = null;
      }
    });
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.nuevaImagen = input.files[0];
  
      // ✅ Limpiamos imagenUrl si se sube archivo
      this.oProveedorForm?.get('imagenUrl')?.setValue('');
  
      const reader = new FileReader();
      reader.onload = () => {
        this.imagenPreview = reader.result as string;
      };
      reader.readAsDataURL(this.nuevaImagen);
    }
  }
  
  

  showModal(strMessage: string) {
    this.strMessage = strMessage;
    this.myModal = new bootstrap.Modal(document.getElementById('mimodal'), {
      keyboard: false,
    });
    this.myModal.show();
  }

  hideModal = () => {
    this.myModal.hide();
    this.oRouter.navigate(['admin/proveedor/plist/']);
  };

  onSubmit() {
    if (this.oProveedorForm?.invalid) {
      this.showModal('Formulario inválido');
      console.log('Form values:', this.oProveedorForm.value);
      return;
    }
  
    const formData = new FormData();
    formData.append('Empresa', this.oProveedorForm?.get('empresa')?.value);
    formData.append('Email', this.oProveedorForm?.get('email')?.value);
  
    const passwordFormValue = this.oProveedorForm?.get('password')?.value;
    const isSamePassword = passwordFormValue === this.originalPassword;
  
    // 🔐 Hashear solo si cambió
    const passwordToSend = isSamePassword
      ? this.originalPassword
      : this.oCryptoService.getHashSHA256(passwordFormValue);
    formData.append('Password', passwordToSend);
  
    formData.append('TipoProveedor', this.oProveedorForm?.get('tipoproveedor')?.value.id);
  
    const imagenUrl = this.oProveedorForm?.get('imagenUrl')?.value;
  
    // ❌ No permitir ambas formas de imagen
    if (this.nuevaImagen && imagenUrl) {
      this.showModal('No puedes subir una imagen y usar una URL al mismo tiempo');
      return;
    }
  
    if (this.nuevaImagen) {
      formData.append('Imagen', this.nuevaImagen);
    }
  
    if (imagenUrl) {
      formData.append('ImagenUrl', imagenUrl);
    }
  
    this.oProveedorService.update(this.id, formData).subscribe({
      next: (oProveedor: IProveedor) => {
        this.showModal('Proveedor actualizado correctamente');
      },
      error: (error) => {
        let mensaje = 'Error al actualizar el proveedor';
        if (error.status === 400 || error.status === 500) {
          if (error.error?.message) {
            mensaje = error.error.message;
          } else if (typeof error.error === 'string') {
            mensaje = error.error;
          }
        }
        this.showModal(mensaje);
        console.error(error);
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
