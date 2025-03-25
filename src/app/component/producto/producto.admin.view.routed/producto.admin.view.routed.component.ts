import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IProducto } from '../../../model/producto.interface';
import { ProductoService } from '../../../service/producto.service';

@Component({
  selector: 'app-producto.admin.view.routed',
  templateUrl: './producto.admin.view.routed.component.html',
  styleUrls: ['./producto.admin.view.routed.component.css']
})
export class ProductoAdminViewRoutedComponent implements OnInit {
  codigo: number = 0;
  oProducto: IProducto = {} as IProducto;
  modalImage: string = '';

  constructor(
    private oActivatedRoute: ActivatedRoute,
    private oProductoService: ProductoService
  ) { }

  ngOnInit() {
    this.codigo = this.oActivatedRoute.snapshot.params['codigo'];
    this.getOne();
  }

  getOne() {
    this.oProductoService.getOne(this.codigo).subscribe({
      next: (oProducto: IProducto) => {
        this.oProducto = oProducto;
      },
      error: (err) => {
        console.log('Error al obtener los datos del Producto',err);
      },
    });
  }


}
