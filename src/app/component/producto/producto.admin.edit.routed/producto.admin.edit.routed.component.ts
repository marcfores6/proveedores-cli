import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { IProducto } from '../../../model/producto.interface';
import { ProductoService } from '../../../service/producto.service';
import { ITipoProducto } from '../../../model/tipoproducto.interface';
import { MatDialog } from '@angular/material/dialog';
import { TipoProductoSelectorComponent } from '../../tipoproducto/tipoproductoselector/tipoproductoselector.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

declare let bootstrap: any;
@Component({
  selector: 'app-producto.admin.edit.routed',
  templateUrl: './producto.admin.edit.routed.component.html',
  styleUrls: ['./producto.admin.edit.routed.component.css'],
  standalone: true,
  imports: [RouterModule, ReactiveFormsModule, CommonModule, MatFormFieldModule, MatInputModule, MatSelectModule],
})
export class ProductoAdminEditRoutedComponent implements OnInit {

  codigo: number = 0;
  oProductoForm: FormGroup | undefined = undefined;
  oProducto: IProducto | null = null;
  imagen: string | null = null;
  nuevaImagen: File | null = null;
  imagenPreview: string | null = null;
  strMessage: string = '';
  myModal: any;

  readonly dialog = inject(MatDialog);
  oTipoProducto: ITipoProducto = {} as ITipoProducto;

  constructor(
    private oActivatedRoute: ActivatedRoute,
    private oProductoService: ProductoService,
    private oRouter: Router,
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    this.codigo = this.oActivatedRoute.snapshot.params['codigo'];
    this.oProductoForm = this.fb.group({
      codigo: ['', [Validators.required]],
      nombre: ['', [Validators.required]],
      tipoproducto: new FormGroup({
        id: new FormControl('', Validators.required),
        descripcion: new FormControl(''),
      }),
      imagenUrl: new FormControl('', [Validators.pattern('^(https?:\\/\\/|\/).+')])
    });

    this.cargarProducto();
  }

  cargarProducto(): void {
    this.oProductoService.get(this.codigo).subscribe({
      next: (data: IProducto) => {
        this.oProducto = data;
        this.oProductoForm?.patchValue({
          codigo: data.codigo,
          nombre: data.nombre,
          tipoproducto: data.tipoproducto
            ? {
              id: data.tipoproducto.id,
              descripcion: data.tipoproducto.descripcion,
            }
            : {
              id: null,
              descripcion: '',
            },
          imagenUrl: data.imagenUrl ?? ''
        });

        if (data.imagenUrl && data.imagenUrl.trim() !== '') {
          this.imagen = 'http://localhost:8086' + data.imagenUrl;
        } else {
          this.cargarImagen();
        }
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  cargarImagen(): void {
    this.oProductoService.getImagen(this.codigo).subscribe({
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
      this.oProductoForm?.get('imagenUrl')?.setValue('');

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
    this.oRouter.navigate(['admin/producto/plist/']);
  };

  onSubmit(): void {
    if (this.oProductoForm?.invalid) {
      this.showModal('Formulario inválido');
      return;
    }

    const formData = new FormData();
    formData.append('Nombre', this.oProductoForm?.get('nombre')?.value);
    formData.append('TipoProducto', this.oProductoForm?.get('tipoproducto')?.value.id);

    const imagenUrl = this.oProductoForm?.get('imagenUrl')?.value;

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

    this.oProductoService.update(this.codigo, formData).subscribe({
      next: () => {
        this.showModal('Producto actualizado correctamente!');
      },
      error: (error) => {
        console.error(error);
      }
    });
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