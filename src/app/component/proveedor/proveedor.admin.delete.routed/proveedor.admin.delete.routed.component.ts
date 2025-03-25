import { Component, OnInit } from '@angular/core';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { IProveedor } from '../../../model/proveedor.interface';
import { ProveedorService } from '../../../service/proveedor.service';

declare let bootstrap: any;
@Component({
  selector: 'app-proveedor.admin.delete.routed',
  templateUrl: './proveedor.admin.delete.routed.component.html',
  styleUrls: ['./proveedor.admin.delete.routed.component.css'],
  standalone: true,
  imports: [RouterModule]
})
export class ProveedorAdminDeleteRoutedComponent implements OnInit {
  oProveedor: IProveedor | null = null;
  strMessage: string = '';
  myModal: any;

  constructor(
    private oProveedorService: ProveedorService,
    private oRouter: Router,
    private oActivatedRoute: ActivatedRoute
  ) { }

  ngOnInit(): void {
      let id = this.oActivatedRoute.snapshot.params['id'];
      this.oProveedorService.get(id).subscribe({
        next: (oProveedor: IProveedor) => {
          this.oProveedor = oProveedor;
        },
        error: (err) => {
          this.showModal('Error al cargar el proveedor');
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
  
    deleteProveedor(): void {
      this.oProveedorService.delete(this.oProveedor!.id).subscribe({
        next: (data) => {
          this.showModal(
            'Proveedor con id ' + this.oProveedor!.id + ' ha sido borrado'
          );
        },
        error: (error) => {
          this.showModal('Error al borrar el Proveedor');
        },
      });
    }
  
    hideModal = () => {
      this.myModal.hide();
      this.oRouter.navigate(['/admin/proveedor/plist']);
    }
  
  }
  