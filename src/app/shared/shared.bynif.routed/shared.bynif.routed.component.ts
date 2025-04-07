import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProveedorService } from '../../service/proveedor.service';
import { IProveedor } from '../../model/proveedor.interface';

@Component({
  selector: 'app-shared.bynif.routed',
  templateUrl: './shared.bynif.routed.component.html',
  styleUrls: ['./shared.bynif.routed.component.css']
})
export class SharedBynifRoutedComponent implements OnInit {

  id: number=0;
  nif: string = '';
  oProveedor: IProveedor = {} as IProveedor;

  constructor(private oActivatedRoute: ActivatedRoute, private oProveedorService: ProveedorService) { }

  ngOnInit() {
    this.nif = this.oActivatedRoute.snapshot.params['nif'];
    this.getOne();
  }

  getOne() {
    this.oProveedorService.getProveedorByNif(this.nif).subscribe({
      next: (oProveedor) => {
        this.oProveedor = oProveedor;
      },
      error: (err) => {
        console.log(err);
      }
    });
  }

}
