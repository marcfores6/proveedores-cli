import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { IProveedor } from '../../../model/proveedor.interface';
import { ProveedorService } from '../../../service/proveedor.service';

declare let bootstrap: any;
@Component({
  selector: 'app-proveedor.admin.create.routed',
  templateUrl: './proveedor.admin.create.routed.component.html',
  styleUrls: ['./proveedor.admin.create.routed.component.css'],
  standalone: true,
  imports: [RouterModule, ReactiveFormsModule,CommonModule],
})
export class ProveedorAdminCreateRoutedComponent implements OnInit {

  id: number = 0;
  oProveedorForm: FormGroup | undefined = undefined;
  oProveedor: IProveedor | null = null;
  strMessage: string = '';
  myModal: any;

  constructor(
    private oActivatedRoute: ActivatedRoute,
    private oProveedorService: ProveedorService,
    private oRouter: Router
  ) {
    this.oActivatedRoute.params.subscribe((params) => {
      this.id = params['id'];
    });
   }

  ngOnInit() {
    this.createForm();
    this.get();
    this.oProveedorForm?.markAllAsTouched();
  }
  
  createForm(){
    this.oProveedorForm = new FormGroup({
      id: new FormControl<number | null>(null, [Validators.required]),
      nombre: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50),
      ]),
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
    })
  }

  onReset() {
    this.oProveedorService.get(this.id).subscribe({
      next: (oProveedor: IProveedor) => {
        this.oProveedor= oProveedor;
        this.updateForm();
      },
      error: (error) => {
        console.error(error);
      },
    });
    return false;
  }

  updateForm() {
    this.oProveedorForm?.controls['id'].setValue(this.oProveedor?.id);
    this.oProveedorForm?.controls['empresa'].setValue(this.oProveedor?.empresa);
    this.oProveedorForm?.controls['email'].setValue(this.oProveedor?.email);
    this.oProveedorForm?.controls['password'].setValue(this.oProveedor?.password);
  }

  get() {
    this.oProveedorService.get(this.id).subscribe({
      next: (oProveedor: IProveedor) => {
        this.oProveedor = oProveedor;
        this.updateForm();
      },
      error: (error) => {
        console.error(error);
      },
    });
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
    this.oRouter.navigate(['/proveedor/plist/']);
  };


  onSubmit() {
    this.oProveedor = this.oProveedorForm?.value;
    this.oProveedorService.update(this.oProveedorForm?.value).subscribe({
      next: (oProveedor: IProveedor) => {
        this.oProveedor = oProveedor;
        this.showModal('Proveedor ' + this.oProveedor.id + ' actualizado correctamente');
      },
      error: (error) => {
        console.error(error);
        this.showModal('Error al actualizar el Proveedor');
      },
    });
  }

}
