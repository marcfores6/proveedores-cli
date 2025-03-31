import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IProveedor } from '../../model/proveedor.interface';
import { ProveedorService } from '../../service/proveedor.service';


@Component({
  selector: 'app-shared.byemail.routed',
  templateUrl: './shared.byemail.routed.component.html',
  styleUrls: ['./shared.byemail.routed.component.css']
})
export class SharedByemailRoutedComponent implements OnInit {

  id: number=0;
  email: string = "";
  oProveedor: IProveedor = {} as IProveedor;
  imagen: string | undefined;
  modalImage: string = '';

  constructor(private oActivatedRoute: ActivatedRoute, private oProveedorService: ProveedorService) { }

  ngOnInit() {
    
    this.id = this.oActivatedRoute.snapshot.params['id'];
    this.email = this.oActivatedRoute.snapshot.params['email'];
    this.getOne();
  }
  
  getOne() {
    this.oProveedorService.getProveedorByEmail(this.email).subscribe({
      next: (data: IProveedor) => {
        this.oProveedor = data;
  
        if (this.oProveedor.imagenUrl && this.oProveedor.imagenUrl.trim() !== '') {
          this.imagen = this.oProveedor.imagenUrl;
        } else {
          this.verImagen(this.oProveedor.id);
        }
      },
      error: (err) => {
        console.error('Error al obtener los datos del Proveedor', err);
      }
    });
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
        this.imagen = undefined;
      },
    });
  }

}
