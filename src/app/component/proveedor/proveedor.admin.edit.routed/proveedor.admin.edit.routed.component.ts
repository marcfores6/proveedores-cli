import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { IProveedor } from '../../../model/proveedor.interface';
import { ProveedorService } from '../../../service/proveedor.service';

declare let bootstrap: any;
@Component({
  selector: 'app-proveedor.admin.edit.routed',
  templateUrl: './proveedor.admin.edit.routed.component.html',
  styleUrls: ['./proveedor.admin.edit.routed.component.css'],
  standalone: true,
  imports: [RouterModule, ReactiveFormsModule, CommonModule],
})
export class ProveedorAdminEditRoutedComponent implements OnInit {

  id: number = 0;
  oProveedorForm: FormGroup | undefined = undefined;
  oProveedor: IProveedor | null = null;
  imagen: string | null = null;
  nuevaImagen: File | null = null;
  strMessage: string = '';
  myModal: any;

  constructor(
    private oActivatedRoute: ActivatedRoute,
    private oProveedorService: ProveedorService,
    private oRouter: Router,
    private fb: FormBuilder
  ) {
  }

  ngOnInit() {
    this.id = this.oActivatedRoute.snapshot.params['id'];
    this.oProveedorForm = this.fb.group({
      id: ['', [Validators.required]],
      empresa: ['', [Validators.required]],
      email: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
    this.cargarProducto();
  }

  cargarProducto(): void {
    this.oProveedorService.get(this.id).subscribe({
      next: (data: IProveedor) => {
        this.oProveedor = data;
        this.oProveedorForm?.patchValue({
          id: data.id,
          empresa: data.empresa,
          email: data.email,
          password: data.password
        });
        this.cargarImagen();
      },
      error: (error) => {
        console.error(error);
      }
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

      const reader = new FileReader();
      reader.onload = () => {
        this.imagen = reader.result as string;
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
    const formData = new FormData();
    formData.append('Empresa', this.oProveedorForm?.get('empresa')?.value);
    formData.append('Email', this.oProveedorForm?.get('email')?.value);
    formData.append('Password', this.oProveedorForm?.get('password')?.value);

    if (this.nuevaImagen) {
      formData.append('Imagen', this.nuevaImagen);
    }

    this.oProveedorService.update(this.id, formData).subscribe({
      next: (oProveedor: IProveedor) => {
        this.showModal('Proveedor actualizado correctamente');
      },
      error: (error) => {
        this.showModal('Error al actualizar el Proveedor');
        console.error(error);
      }
    });
  }


}

