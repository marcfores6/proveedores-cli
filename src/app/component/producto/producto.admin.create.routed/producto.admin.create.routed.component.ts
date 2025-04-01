import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialog } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { ProductoService } from '../../../service/producto.service';
import { IProducto } from '../../../model/producto.interface';
import { ITipoProducto } from '../../../model/tipoproducto.interface';
import { TipoProductoSelectorComponent } from '../../tipoproducto/tipoproductoselector/tipoproductoselector.component';

declare let bootstrap: any;

@Component({
  selector: 'app-producto-admin-create',
  templateUrl: './producto.admin.create.routed.component.html',
  styleUrls: ['./producto.admin.create.routed.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    RouterModule
  ]
})
export class ProductoAdminCreateRoutedComponent implements OnInit {
  oProductoForm!: FormGroup;
  oProducto: IProducto | null = null;
  oTipoProducto: ITipoProducto = {} as ITipoProducto;

  imagenesArchivo: File[] = [];
  imagenesUrl: string[] = [];
  imagenPreviews: string[] = [];

  imagenUrlControl = new FormControl('', [Validators.pattern('https?://.+')]);
  strMessage: string = '';
  myModal: any;

  constructor(
    private fb: FormBuilder,
    private oProductoService: ProductoService,
    private oRouter: Router,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.oProductoForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      tipoproducto: new FormGroup({
        id: new FormControl('', Validators.required),
        descripcion: new FormControl(''),
      }),
    });
  }

  onFileSelect(event: any): void {
    const files: FileList = event.target.files;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      this.imagenesArchivo.push(file);

      const reader = new FileReader();
      reader.onload = () => {
        this.imagenPreviews.push(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  agregarImagenUrl(): void {
    const url = this.imagenUrlControl.value;
    if (url && !this.imagenesUrl.includes(url)) {
      this.imagenesUrl.push(url);
      this.imagenUrlControl.setValue('');
    }
  }

  onReset(): void {
    this.oProductoForm.reset();
    this.imagenesArchivo = [];
    this.imagenPreviews = [];
    this.imagenesUrl = [];
    this.imagenUrlControl.setValue('');
  }
  

  eliminarImagenPreview(index: number): void {
    this.imagenesArchivo.splice(index, 1);
    this.imagenPreviews.splice(index, 1);
  }

  eliminarImagenUrl(index: number): void {
    this.imagenesUrl.splice(index, 1);
  }

  onSubmit(): void {
    if (this.oProductoForm.invalid) {
      this.showModal('Formulario inválido');
      return;
    }

    const formData = new FormData();
    formData.append('Nombre', this.oProductoForm.get('nombre')?.value);
    formData.append('TipoProducto', this.oProductoForm.get('tipoproducto.id')?.value);

    this.imagenesArchivo.forEach((file) => {
      formData.append('Imagen', file);
    });

    this.imagenesUrl.forEach((url) => {
      formData.append('ImagenUrl', url);
    });

    this.oProductoService.create(formData).subscribe({
      next: (producto: IProducto) => {
        this.oProducto = producto;
        this.showModal('Producto creado con éxito');
      },
      error: (error) => {
        console.error('Error al crear producto', error);
        this.showModal('Error al crear el producto');
      }
    });
  }

  showModal(mensaje: string): void {
    this.strMessage = mensaje;
    this.myModal = new bootstrap.Modal(document.getElementById('mimodal')!);
    this.myModal.show();
  }

  hideModal = () => {
    this.myModal.hide();
    this.oRouter.navigate(['/admin/producto/view', this.oProducto?.codigo]);
  };

  showTipoProductoSelectorModal() {
    const dialogRef = this.dialog.open(TipoProductoSelectorComponent, {
      height: '800px',
      width: '80%',
      maxWidth: '90%',
      data: { origen: '', idProducto: '' },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.oProductoForm?.controls['tipoproducto'].setValue({
          id: result.id,
          descripcion: result.descripcion,
        });
      }
    });
  }
}
