import { Component, inject, OnInit } from '@angular/core';
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
import { ITipoProducto } from '../../../model/tipoproducto.interface';
import { MatDialog } from '@angular/material/dialog';
import { TipoProductoSelectorComponent } from '../../tipoproducto/tipoproductoselector/tipoproductoselector.component';
import { SharedLoginRoutedComponent } from "../../../shared/shared.login.routed/shared.login.routed";

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
    SharedLoginRoutedComponent
],
  templateUrl: './producto.admin.create.routed.component.html',
  styleUrls: ['./producto.admin.create.routed.component.css']
})
export class ProductoAdminCreateRoutedComponent implements OnInit {

  codigo: number = 0;
  oProductoForm: FormGroup | undefined = undefined;
  oProducto: IProducto | null = null;
  strMessage: string = '';
  imagen: File | null = null;

  readonly dialog = inject(MatDialog);
  oTipoProducto: ITipoProducto = {} as ITipoProducto;

  myModal: any;
  form: FormGroup = new FormGroup({});

  constructor(
    private oRouter: Router,
    private oProductoService: ProductoService,
    private fb: FormBuilder
  ) {
    this.oProductoForm = this.fb.group({
      nombre: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50),
      ]),
      tipoproducto: new FormGroup({
        id: new FormControl('', Validators.required), // ID de tipocuenta
        descripcion: new FormControl(''), // Descripción de tipocuenta
      }),
      imagenUrl: new FormControl('', [Validators.pattern('https?://.+')]),
     // imagen: [null]
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
    this.oProductoForm?.controls['tipoproducto'].setValue({
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
    this.oRouter.navigate(['/admin/producto/view/' + this.oProducto?.codigo]);
  }

  onSubmit() {
    if (this.oProductoForm?.invalid) {
      this.showModal('Formulario inválido');
      return;
    } else {
      const formData = new FormData();
      formData.append('Nombre', this.oProductoForm?.get('nombre')?.value);
      formData.append('TipoProducto', this.oProductoForm?.get('tipoproducto')?.value.id);
      /*if (this.imagen) {
        formData.append('Imagen', this.imagen);
      }*/

      //NUevo IMAGEN URL
      const imagenUrl = this.oProductoForm?.get('imagenUrl')?.value;
      if (imagenUrl) {
        formData.append('ImagenUrl', imagenUrl); // Esto debe estar soportado en el backend
      }

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

  showTipoProductoSelectorModal() {
    const dialogRef = this.dialog.open(TipoProductoSelectorComponent, {
      height: '800px',
      maxHeight: '1200px',
      width: '80%',
      maxWidth: '90%',
      data: { origen: '', idProducto: '' },


    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      if (result !== undefined) {
        console.log(result);
        this.oProductoForm?.controls['tipoproducto'].setValue({
          id: result.id,
          descripcion: result.descripcion,
        });
      }
    });
    return false;
  }



}
