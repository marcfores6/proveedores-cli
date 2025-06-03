import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { IProducto } from '../../../model/producto.interface';
import { ProductoService } from '../../../service/producto.service';
import { CommonModule } from '@angular/common';
import { NoDisponiblePipe } from '../../../pipe/no-disponible.pipe';
import { EntornoService } from '../../../service/entorno.service';

@Component({
  selector: 'app-producto.admin.view.routed',
  templateUrl: './producto.admin.view.routed.component.html',
  styleUrls: ['./producto.admin.view.routed.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, NoDisponiblePipe]
})
export class ProductoAdminViewRoutedComponent implements OnInit {
  id: number = 0;
  oProducto: IProducto = {} as IProducto;
  activeIndex: number = 0;
  totalImagenes: number = 0;
  imagenesUrl: string[] = [];

  isDev: boolean = false;

  @ViewChild('carouselProductoImagenes', { static: false }) carouselRef!: ElementRef;

  constructor(
    private oActivatedRoute: ActivatedRoute,
    private oProductoService: ProductoService,
    private entornoService: EntornoService,
  ) {}

  ngOnInit() {
    this.id = this.oActivatedRoute.snapshot.params['id'];
    this.getOne();

    const entornoAnterior = localStorage.getItem('entornoActual');

    this.entornoService.getEntorno$().subscribe({
      next: (nuevoEntorno) => {
        this.isDev = nuevoEntorno === 'dev';

        if (nuevoEntorno !== entornoAnterior) {
          localStorage.setItem('entornoActual', nuevoEntorno);

          // Esperamos un poco para asegurar que el localStorage se ha actualizado antes de recargar
          setTimeout(() => {
            location.reload();
          }, 100);
        }
      }
    });
  }

  getOne() {
    this.oProductoService.getOne(this.id).subscribe({
      next: (oProducto: IProducto) => {
        this.oProducto = oProducto;

        // Cargar imágenes si existen
        if (this.oProducto.imagenes && this.oProducto.imagenes.length > 0) {
          this.imagenesUrl = this.oProducto.imagenes
            .filter(img => !!img.imagenUrl)
            .map(img =>
              img.imagenUrl!.startsWith('http')
                ? img.imagenUrl!
                : 'https://proveedores-back-familycash.onrender.com' + img.imagenUrl!
            );
          this.totalImagenes = this.oProducto.imagenes.length;
          this.activeIndex = 0;

          // Esperar a que el carrusel esté en el DOM para registrar el listener
          setTimeout(() => this.registrarEventoCarrusel(), 0);
        }
      },
      error: (err) => {
        console.error('Error al obtener los datos del Producto:', err);
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
