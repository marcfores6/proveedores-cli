import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { IProveedor } from '../../../model/proveedor.interface';
import { ProveedorService } from '../../../service/proveedor.service';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

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
    MatSelectModule]
})
export class ProveedorAdminCreateRoutedComponent implements OnInit {

  id: number = 0;
  oProveedorForm: FormGroup | undefined = undefined;
  oProveedor: IProveedor | null = null;
  strMessage: string = '';
  imagen: File | null = null;

  myModal: any;

  form: FormGroup = new FormGroup({});

  constructor(
    private fb: FormBuilder,
    private oProveedorService: ProveedorService,
    private oRouter: Router
  ) {
    this.oProveedorForm =  this.fb.group({
      empresa: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50),
      ]),
      email: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50),
      ]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50),
      ]),
      imagen: [null]
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
    this.oRouter.navigate(['admin/proveedor/view/'+ this.oProveedor?.id]);
  };

  onSubmit() {
    if (this.oProveedorForm?.invalid) {
          this.showModal('Formulario inválido');
          return;
        } else {      
          const formData = new FormData();
          formData.append('Empresa', this.oProveedorForm?.get('empresa')?.value);
          formData.append('Email', this.oProveedorForm?.get('email')?.value);
          formData.append('Password', this.oProveedorForm?.get('password')?.value);
          formData.append('Imagen', this.imagen!);
    
          this.oProveedorService.create(formData).subscribe({
            next: (oProveedor: IProveedor) => {
              this.oProveedor = oProveedor;
              this.showModal('Proveedor creado con el codigo: ' + this.oProveedor.id);
            },
            error: (err) => {
              this.showModal('Error al crear el Proveedor');
              console.log(err);
            },
          });
        }

}
}
