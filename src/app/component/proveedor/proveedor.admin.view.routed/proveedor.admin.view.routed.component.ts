import { Component, OnInit } from '@angular/core';
import { IProveedor } from '../../../model/proveedor.interface';
import { ProveedorService } from '../../../service/proveedor.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-proveedor.admin.view.routed',
  templateUrl: './proveedor.admin.view.routed.component.html',
  styleUrls: ['./proveedor.admin.view.routed.component.css'],
  standalone: true,
  imports: []
})
export class ProveedorAdminViewRoutedComponent implements OnInit {
  id:number = 0;
  oProveedor: IProveedor = {} as IProveedor;
  imagen: string | null = null;
  modalImage: string = '';

  constructor(
    private oActivatedRoute: ActivatedRoute,
    private oProveedorService: ProveedorService
  ) { }

  ngOnInit() {
    this.id = this.oActivatedRoute.snapshot.params['id'];
    this.getOne();
    this.verImagen(this.id);
  }

  verImagen(id: number): void {
      this.oProveedorService.getImagen(id).subscribe({
        next: (blob: Blob) => {
          const reader = new FileReader();
          reader.onload = () => {
            this.imagen = reader.result as string;
          };
          reader.readAsDataURL(blob);
        },
        error: (error) => {
          console.log('Error al obtener la imagen', error);
          this.imagen = null;
        },
      });
    }
  
    getOne() {
      this.oProveedorService.getOne(this.id).subscribe({
        next: (oProveedor: IProveedor) => {
          this.oProveedor = oProveedor;
        },
        error: (err) => {
          console.log('Error al obtener los datos del Proveedor',err);
        },
      });
    }

}
