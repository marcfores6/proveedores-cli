import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { IProducto } from '../../../model/producto.interface';
import { ProductoService } from '../../../service/producto.service';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

declare let bootstrap: any;
@Component({
  selector: 'app-producto.admin.delete.routed',
  templateUrl: './producto.admin.delete.routed.component.html',
  styleUrls: ['./producto.admin.delete.routed.component.css'],
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
  ]
})
export class ProductoAdminDeleteRoutedComponent implements OnInit {
  oProducto: IProducto | null = null;
  strMessage: string = '';
  myModal: any;

  constructor(
    private oProductoService: ProductoService,
    private oRouter: Router,
    private oActivatedRoute: ActivatedRoute
  ) { }

  ngOnInit(): void {
    let id = this.oActivatedRoute.snapshot.params['id'];
    this.oProductoService.get(id).subscribe({
      next: (oProducto: IProducto) => {
        this.oProducto = oProducto;
      },
      error: (err) => {
        this.showModal('Error al cargar el producto');
      },
    });
  }

  showModal(mensaje: string) {
    this.strMessage = mensaje;
    this.myModal = new bootstrap.Modal(document.getElementById('mimodal'), {
      keyboard: false,
    });
    this.myModal.show();
  }

  deleteProducto(): void {
    this.oProductoService.delete(this.oProducto!.id).subscribe({
      next: (data) => {
        this.showModal(
          'Producto con id ' + this.oProducto!.id + ' ha sido borrado'
        );
      },
      error: (error) => {
        this.showModal('Error al borrar el Producto');
      },
    });
  }

  hideModal = () => {
    this.myModal.hide();
    this.oRouter.navigate(['/admin/producto/plist']);
  }

  getProductoKeys(): (keyof IProducto)[] {
    return this.oProducto ? Object.keys(this.oProducto) as (keyof IProducto)[] : [];
  }
  

}
