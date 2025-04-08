import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { IProducto } from '../../../model/producto.interface';
import { ProductoService } from '../../../service/producto.service';
import { MatDialog } from '@angular/material/dialog';
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
  id: number = 0;
  oProductoForm: FormGroup;
  oProducto: IProducto | null = null;
  imagenPreviews: string[] = [];
  imagenUrls: string[] = [];
  strMessage: string = '';
  myModal: any;
  camposProducto: string[] = [];
  paisesList: { id: number; nombre: string; codigo: string }[] = [];

  readonly dialog = inject(MatDialog);

  constructor(
    private oActivatedRoute: ActivatedRoute,
    private oProductoService: ProductoService,
    private oRouter: Router,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.oProductoForm = this.fb.group({});
  }

  ngOnInit() {
    this.id = this.oActivatedRoute.snapshot.params['id'];
    this.cargarPaises();
    this.cargarProducto();
  }

  cargarPaises(): void {
    this.paisesList = [ { id: 70, nombre: 'España', codigo: 'ESP' }, { id: 235, nombre: 'United States', codigo: 'USA' }, /* Añade aquí tu lista completa */ ];
  }

  cargarProducto(): void {
    this.oProductoService.get(this.id).subscribe({
      next: (data: IProducto) => {
        this.oProducto = data;
        this.oProductoForm = this.fb.group({});
  
        Object.entries(data).forEach(([key, value]) => {
          if (key === 'imagenes') return;
  
          // Aplica validator required por defecto
          const control = new FormControl(value ?? '', { 
            nonNullable: true, 
            validators: Validators.required 
          });
  
          this.oProductoForm.addControl(key, control);
  
          // Si está vacío, lo marcamos como touched y dirty para que se pinte en rojo
          if (value === null || value === undefined || value === '') {
            control.markAsTouched();
            control.markAsDirty();
          }
        });
  
        this.camposProducto = Object.keys(data).filter(key => key !== 'imagenes');
      },
      error: (error) => {
        console.error('Error al cargar el producto:', error);
        this.showModal('No se pudo cargar el producto.');
      },
    });
  }
  

  showModal(strMessage: string) {
    this.strMessage = strMessage;
    this.myModal = new bootstrap.Modal(document.getElementById('mimodal'), { keyboard: false });
    this.myModal.show();
  }

  hideModal = () => {
    this.myModal.hide();
    this.oRouter.navigate(['/admin/producto/plist']);
  };

  eliminarImagen(idImagen: number): void {
    if (confirm('¿Seguro que deseas eliminar esta imagen?')) {
      this.oProductoService.deleteImagen(idImagen).subscribe({
        next: () => {
          this.oProducto!.imagenes = this.oProducto!.imagenes!.filter(img => img.id !== idImagen);
        },
        error: (err) => {
          console.error('Error al eliminar la imagen', err);
          alert('No se pudo eliminar la imagen.');
        },
      });
    }
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      const files = Array.from(input.files);
      this.imagenPreviews = [];

      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.imagenPreviews.push(e.target.result);
        };
        reader.readAsDataURL(file);
      });
    }
  }

  removeImage(index: number): void {
    const input = document.getElementById('imagenes') as HTMLInputElement;
    this.imagenPreviews.splice(index, 1);

    if (input?.files) {
      const dt = new DataTransfer();
      const files = Array.from(input.files);
      files.splice(index, 1);
      files.forEach(f => dt.items.add(f));
      input.files = dt.files;
    }
  }

  onSubmit(): void {
    if (this.oProductoForm.invalid) {
      this.showModal('Formulario inválido');
      return;
    }

    const formData = new FormData();
    Object.entries(this.oProductoForm.value).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, value as string);
      }
    });

    this.imagenUrls.forEach(url => formData.append('imagenUrls', url));

    const inputImagenes = document.getElementById('imagenes') as HTMLInputElement;
    if (inputImagenes && inputImagenes.files) {
      Array.from(inputImagenes.files).forEach(file => {
        formData.append('imagenes', file);
      });
    }

    this.oProductoService.update(this.id, formData).subscribe({
      next: () => {
        this.showModal('Producto actualizado correctamente!');
        this.cargarProducto();
      },
      error: (error) => {
        console.error(error);
        this.showModal('Error al actualizar el producto.');
      },
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.oProductoForm.get(fieldName);
    return control ? control.invalid && control.touched : false;
  }

  addImageUrl(url: string): void {
    if (url && !this.imagenUrls.includes(url)) {
      this.imagenUrls.push(url);
    }
  }

  removeImageUrl(url: string): void {
    this.imagenUrls = this.imagenUrls.filter(u => u !== url);
  }

  onReset(): void {
    this.oProductoForm.reset();
    this.imagenPreviews = [];
    this.imagenUrls = [];
  }
}
