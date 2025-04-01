import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
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
  activeIndex: number = 0;
  totalImagenes: number = 0;
  imagenesUrl: string[] = [];

  @ViewChild('carouselProveedorImagenes', { static: false }) carouselRef!: ElementRef;

  constructor(private oActivatedRoute: ActivatedRoute, private oProveedorService: ProveedorService) { }

  ngOnInit() {
    this.email = this.oActivatedRoute.snapshot.params['email'];
    this.getOne();
  }
  

  getOne() {
    this.oProveedorService.getProveedorByEmail(this.email).subscribe({
      next: (oProveedor: IProveedor) => {
        this.oProveedor = oProveedor;

        if (this.oProveedor.imagenUrl && this.oProveedor.imagenUrl.trim() !== '') {
          this.imagen = 'http://localhost:8086/' + this.oProveedor.imagenUrl;
        }

        if (this.oProveedor.imagenes && this.oProveedor.imagenes.length > 0) {
          this.imagenesUrl = this.oProveedor.imagenes
            .filter(img => img.imagenUrl)
            .map(img =>
              img.imagenUrl!.startsWith('http')
                ? img.imagenUrl!
                : 'http://localhost:8086' + img.imagenUrl!
            );
          this.totalImagenes = this.oProveedor.imagenes.length;
          this.activeIndex = 0;

          setTimeout(() => this.registrarEventoCarrusel(), 0);
        }
      },
      error: (err) => {
        console.log('Error al obtener los datos del Proveedor', err);
      }
    });
  }

  registrarEventoCarrusel() {
    if (this.carouselRef?.nativeElement) {
      const carouselElement = this.carouselRef.nativeElement;
      carouselElement.removeEventListener('slid.bs.carousel', this.carouselListener);
      carouselElement.addEventListener('slid.bs.carousel', this.carouselListener);
    }
  }

  carouselListener = (event: any) => {
    this.activeIndex = event.to;
  };

}
