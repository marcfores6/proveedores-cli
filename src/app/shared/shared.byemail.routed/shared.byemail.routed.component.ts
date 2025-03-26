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

  email: string = "";
  oProveedor: IProveedor = {} as IProveedor;
  fotoDni: string | undefined;
  modalImage: string = '';

  constructor(private oActivatedRoute: ActivatedRoute, private oProveedorService: ProveedorService) { }

  ngOnInit() {
    this.email = this.oActivatedRoute.snapshot.params['email'];
    this.getOne();
  }
  
  getOne() {
    this.oProveedorService.getProveedorByEmail(this.email).subscribe({
      next: (data: IProveedor) => {
        this.oProveedor = data;
      },
      error: (err) => {
        console.error('Error al obtener los datos del Proveedor', err);
      }
    });
  }

}
