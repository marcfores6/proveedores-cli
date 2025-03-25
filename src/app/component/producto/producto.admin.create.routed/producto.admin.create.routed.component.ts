import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import {
  FormBuilder,
  FormControl,
  FormGroup,  
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { IProducto } from '../../../model/producto.interface';
import { ProductoService } from '../../../service/producto.service';

declare let bootstrap: any;

@Component({
  selector: 'app-producto.admin.create.routed',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
    RouterModule,
  ],
  templateUrl: './producto.admin.create.routed.component.html',
  styleUrls: ['./producto.admin.create.routed.component.css']
})
export class ProductoAdminCreateRoutedComponent implements OnInit {

  codigo: number=0;
  oProductoForm: FormGroup | undefined = undefined;
  oProducto: IProducto |null = null;
  strMessage: string = '';
  imagen: File | null = null;

  myModal: any;

  form: FormGroup = new FormGroup({});

  constructor(
    private oRouter: Router,
    private oProductoService: ProductoService,
    private fb: FormBuilder
  ) {
    this.oProductoForm =  this.fb.group({
      nombre: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50),
      ]),
      imagen: [null]
    });
  }

  ngOnInit() {
    this.oProductoForm?.markAllAsTouched();
  }

  onFileSelect(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.imagen = file;
    }
  }

  updateForm() {
    this.oProductoForm?.controls['nombre'].setValue('');
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
    this.oRouter.navigate(['/admin/producto/view/' + this.oProducto?.codigo]);
  }

  onSubmit() {
    if (this.oProductoForm?.invalid) {
      this.showModal('Formulario inválido');
      return;
    } else {      
      const formData = new FormData();
      formData.append('Nombre', this.oProductoForm?.get('nombre')?.value);
      formData.append('Imagen', this.imagen!);

      this.oProductoService.create(formData).subscribe({
        next: (oProducto: IProducto) => {
          this.oProducto = oProducto;
          this.showModal('Producto creado con el codigo: ' + this.oProducto.codigo);
        },
        error: (err) => {
          this.showModal('Error al crear el Producto');
          console.log(err);
        },
      });
    }
  }

}
