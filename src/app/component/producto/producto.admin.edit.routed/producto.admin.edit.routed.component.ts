import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { IProducto } from '../../../model/producto.interface';
import { ProductoService } from '../../../service/producto.service';

declare let bootstrap: any;
@Component({
  selector: 'app-producto.admin.edit.routed',
  templateUrl: './producto.admin.edit.routed.component.html',
  styleUrls: ['./producto.admin.edit.routed.component.css'],
  standalone: true,
  imports: [RouterModule, ReactiveFormsModule,CommonModule],
})
export class ProductoAdminEditRoutedComponent implements OnInit {

  codigo: number = 0;
  oProductoForm: FormGroup | undefined = undefined;
  oProducto: IProducto | null = null;
  strMessage: string = '';
  myModal: any;

  constructor(
    private oActivatedRoute: ActivatedRoute,
    private oProductoService: ProductoService,
    private oRouter: Router
  ) { 
    this.oActivatedRoute.params.subscribe((params) => {
      this.codigo = params['codigo'];
    });
  }

  ngOnInit() {
    this.createForm();
    this.get();
    this.oProductoForm?.markAllAsTouched();
  }

  createForm(){
    this.oProductoForm = new FormGroup({
      codigo: new FormControl<number | null>(null, [Validators.required]),
      nombre: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50),
      ])
    })
  }

  onReset() {
    this.oProductoService.get(this.codigo).subscribe({
      next: (oProducto: IProducto) => {
        this.oProducto= oProducto;
        this.updateForm();
      },

      error: (error) => {
        console.error(error);
      },
    });
    return false;
  }

  updateForm() {
    this.oProductoForm?.controls['codigo'].setValue(this.oProducto?.codigo);
    this.oProductoForm?.controls['nombre'].setValue(this.oProducto?.nombre);
  }

  get() {
    this.oProductoService.get(this.codigo).subscribe({
      next: (oProducto: IProducto) => {
        this.oProducto = oProducto;
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
    this.oRouter.navigate(['/producto/plist/']);
  };


  onSubmit() {
    this.oProducto = this.oProductoForm?.value;
    this.oProductoService.update(this.oProductoForm?.value).subscribe({
      next: (oProducto: IProducto) => {
        this.oProducto = oProducto;
        this.showModal('Producto ' + this.oProducto.codigo + ' actualizado correctamente');
      },
      error: (error) => {
        console.error(error);
        this.showModal('Error al actualizar el producto');
      },
    });
  }
    

}
