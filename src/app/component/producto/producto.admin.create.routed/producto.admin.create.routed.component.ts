import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductoService } from '../../../service/producto.service';
import { ITipoProducto } from '../../../model/tipoproducto.interface';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TipoProductoSelectorComponent } from '../../tipoproducto/tipoproductoselector/tipoproductoselector.component';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';


declare var bootstrap: any;
@Component({
  selector: 'app-producto.admin.create.routed',
  templateUrl: './producto.admin.create.routed.component.html',
  styleUrls: ['./producto.admin.create.routed.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    MatSelectModule,
    RouterModule, // Asegúrate de importar RouterModule
  ],
})
export class ProductoAdminCreateRoutedComponent implements OnInit {

  oProductoForm: FormGroup | undefined = undefined;
  strMessage: string = '';
  imagenes: File[] = [];
  imagenesPreview: string[] = [];
  oProducto: any = {};  // Define `oProducto` aquí como un objeto vacío

  readonly dialog = inject(MatDialog);
  oTipoProducto: ITipoProducto = {} as ITipoProducto;

  myModal: any;

  constructor(
    private oRouter: Router,
    private oProductoService: ProductoService,
    private fb: FormBuilder
  ) {
    this.oProductoForm = this.fb.group({
      nombre: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]),
      tipoproducto: new FormGroup({
        id: new FormControl('', Validators.required),
        descripcion: new FormControl('')
      }),
      imagenUrl: new FormControl('', [Validators.pattern('https?://.+')]),
      imagenes: [null]
    });
  }

  ngOnInit() {
    this.oProductoForm?.markAllAsTouched();
  }

  onFileSelect(event: any): void {
    const files: File[] = Array.from(event.target.files);
    if (files.length) {
      this.imagenes = files;
      this.imagenesPreview = files.map(file => URL.createObjectURL(file)); // Crear vista previa de las imágenes
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
    this.myModal = new bootstrap.Modal(document.getElementById('mimodal'), { keyboard: false });
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
      this.showModal('Formulario inválido');
      return;
    }
  
    const imagenUrl = this.oProductoForm?.get('imagenUrl')?.value;
    if (this.imagenes.length > 0 && imagenUrl) {
      this.showModal('No puedes subir una imagen y usar una URL al mismo tiempo');
      return;
    }
  
    const formData = new FormData();
    formData.append('Nombre', this.oProductoForm?.get('nombre')?.value);
    formData.append('TipoProducto', this.oProductoForm?.get('tipoproducto')?.value.id);
  
    // Subir todas las imágenes
    this.imagenes.forEach(imagen => {
      formData.append('Imagenes', imagen);
    });
  
    // Si se ha proporcionado una URL
    if (imagenUrl) {
      formData.append('ImagenUrl', imagenUrl);
    }
  
    this.oProductoService.create(formData).subscribe({
      next: (oProducto: any) => {  // El tipo de `oProducto` es `any`
        this.oProducto = oProducto;  // Almacenamos el producto creado en `oProducto`
        this.showModal('Producto creado con el código: ' + this.oProducto.codigo);
      },
      error: (err) => {
        let mensaje = 'Error al crear el Producto';
        if (err.status === 400 || err.status === 500) {
          if (err.error?.message) {
            mensaje = err.error.message;
          } else if (typeof err.error === 'string') {
            mensaje = err.error;
          }
        }
        this.showModal(mensaje);
        console.log(err);
      }
    });
  }

  showTipoProductoSelectorModal() {
    const dialogRef = this.dialog.open(TipoProductoSelectorComponent, {
      height: '800px',
      maxHeight: '1200px',
      width: '80%',
      maxWidth: '90%',
      data: { origen: '', idProducto: '' }
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
