import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { IProducto } from '../../../model/producto.interface';
import { ProductoService } from '../../../service/producto.service';

declare let bootstrap: any;
@Component({
  selector: 'app-producto.admin.delete.routed',
  templateUrl: './producto.admin.delete.routed.component.html',
  styleUrls: ['./producto.admin.delete.routed.component.css'],
  standalone: true,
  imports: [RouterModule]
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
    let codigo = this.oActivatedRoute.snapshot.params['codigo'];
    this.oProductoService.get(codigo).subscribe({
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
    this.oProductoService.delete(this.oProducto!.codigo).subscribe({
      next: (data) => {
        this.showModal(
          'Producto con codigo ' + this.oProducto!.codigo + ' ha sido borrado'
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

}
