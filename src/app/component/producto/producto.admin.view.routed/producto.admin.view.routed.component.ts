import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { IProducto } from '../../../model/producto.interface';
import { ProductoService } from '../../../service/producto.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-producto.admin.view.routed',
  templateUrl: './producto.admin.view.routed.component.html',
  styleUrls: ['./producto.admin.view.routed.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class ProductoAdminViewRoutedComponent implements OnInit {
  codigo: number = 0;
  oProducto: IProducto = {} as IProducto;
  imagen: string | null = null;
  modalImage: string = '';
  activeIndex: number = 0;
  totalImagenes: number = 0;
  imagenesUrl: string[] = [];

  @ViewChild('carouselProductoImagenes', { static: false }) carouselRef!: ElementRef;

  constructor(
    private oActivatedRoute: ActivatedRoute,
    private oProductoService: ProductoService
  ) {}

  ngOnInit() {
    this.codigo = this.oActivatedRoute.snapshot.params['codigo'];
    this.getOne();
  }

  getOne() {
    this.oProductoService.getOne(this.codigo).subscribe({
      next: (oProducto: IProducto) => {
        this.oProducto = oProducto;

        if (this.oProducto.imagenUrl && this.oProducto.imagenUrl.trim() !== '') {
          this.imagen = 'http://localhost:8086' + this.oProducto.imagenUrl;
        }

        if (this.oProducto.imagenes && this.oProducto.imagenes.length > 0) {
          this.imagenesUrl = this.oProducto.imagenes
            .filter(img => img.imagenUrl)
            .map(img =>
              img.imagenUrl!.startsWith('http')
                ? img.imagenUrl!
                : 'http://localhost:8086' + img.imagenUrl!
            );
          this.totalImagenes = this.oProducto.imagenes.length;
          this.activeIndex = 0;

          setTimeout(() => this.registrarEventoCarrusel(), 0);
        }
      },
      error: (err) => {
        console.log('Error al obtener los datos del Producto', err);
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
