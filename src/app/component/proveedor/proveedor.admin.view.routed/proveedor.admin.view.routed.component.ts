import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { IProveedor } from '../../../model/proveedor.interface';
import { ProveedorService } from '../../../service/proveedor.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-proveedor.admin.view.routed',
  templateUrl: './proveedor.admin.view.routed.component.html',
  styleUrls: ['./proveedor.admin.view.routed.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class ProveedorAdminViewRoutedComponent implements OnInit {
  id: number = 0;
  oProveedor: IProveedor = {} as IProveedor;
  imagen: string | null = null;
  activeIndex: number = 0;
  totalImagenes: number = 0;
  imagenesUrl: string[] = [];

  @ViewChild('carouselProveedorImagenes', { static: false }) carouselRef!: ElementRef;

  constructor(
    private oActivatedRoute: ActivatedRoute,
    private oProveedorService: ProveedorService
  ) {}

  ngOnInit() {
    this.id = this.oActivatedRoute.snapshot.params['id'];
    this.getOne();
  }

  getOne() {
    this.oProveedorService.getOne(this.id).subscribe({
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