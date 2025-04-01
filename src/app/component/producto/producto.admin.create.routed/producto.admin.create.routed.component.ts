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
import { CommonModule } from '@angular/common';

declare let bootstrap: any;

@Component({
  selector: 'app-producto.admin.create.routed',
  standalone: true,
  imports: [
    CommonModule,
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
  imagenes: File[] = [];  // Array de imágenes seleccionadas
  imagenesPreview: string[] = []; // Array para mostrar vistas previas
  selectedFiles: File[] = [];

  readonly dialog = inject(MatDialog);
  oTipoProducto: ITipoProducto = {} as ITipoProducto;

  myModal: any;

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
      imagenes: [null],
      imagenUrls: [""],
      tipoproducto: new FormGroup({
        id: new FormControl('', Validators.required),
        descripcion: new FormControl(''),
      }),
    });
  }

  ngOnInit() {
    this.oProductoForm?.markAllAsTouched();
  }

  // Método para manejar la selección de múltiples archivos
  onFilesSelect(event: any): void {
    if (event.target.files && event.target.files.length > 0) {
      this.selectedFiles = Array.from(event.target.files);
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
    const productoCodigo = this.oProducto?.codigo; 
    if (productoCodigo) { 
      this.myModal.hide();
      this.oRouter.navigate(['/admin/producto/view/' + productoCodigo]);
    }
  };

  // Método de envío del formulario
  onSubmit() {
    if (this.oProductoForm?.invalid) {
      this.showModal('Formulario inválido');
      return;
    }
  
    const formData = new FormData();
    formData.append('Nombre', this.oProductoForm?.get('nombre')?.value);
    formData.append('TipoProducto', this.oProductoForm?.get('tipoproducto')?.value.id);
  
    // Subir todas las imágenes
    this.selectedFiles.forEach(file => {
      formData.append('Imagen', file);  // Usamos imagenes (en plural)
    });
  
    // Si se ha proporcionado una URL
    const urlsText = this.oProductoForm?.get('imagenUrls')?.value || '';
    const urls = urlsText.split('\n').map((url: string) => url.trim()).filter((url: string) => url !== '');
    if (urls.length > 0) {
    // Por ahora el backend solo permite una URL, podrías iterar en el backend si quieres varias
    formData.append('ImagenUrl', urls[0]);
  }
  
    this.oProductoService.create(formData).subscribe({
      next: (oProducto: any) => {
        this.oProducto = oProducto;
        this.showModal('Producto creado con el código: ' + this.oProducto?.codigo);
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
      if (result !== undefined) {
        this.oProductoForm?.controls['tipoproducto'].setValue({
          id: result.id,
          descripcion: result.descripcion,
        });
      }
    });
    return false;
  }
}
