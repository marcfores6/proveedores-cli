import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subject, debounceTime } from 'rxjs';
import { IPage } from '../../../model/model.interface';
import { IProducto } from '../../../model/producto.interface';
import { ProductoService } from '../../../service/producto.service';
import { BotoneraService } from '../../../service/botonera.service';
import { SessionService } from '../../../service/session.service';

@Component({
  selector: 'app-producto.admin.plist.routed',
  templateUrl: './producto.admin.plist.routed.component.html',
  styleUrls: ['./producto.admin.plist.routed.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
})
export class ProductoAdminPlistRoutedComponent implements OnInit {
  oPage: IPage<IProducto> | null = null;
  nPage: number = 0;
  nRpp: number = 10;
  strField: string = '';
  strDir: string = '';
  strFiltro: string = '';
  arrBotonera: string[] = [];
  customPage: number = 1;
  loading: boolean = false;

  private debounceSubject = new Subject<string>();

  constructor(
    private oProductoService: ProductoService,
    private oBotoneraService: BotoneraService,
    private oRouter: Router,
    private oSessionService: SessionService
  ) {
    this.debounceSubject.pipe(debounceTime(300)).subscribe(() => {
      this.getPage();
    });
  }

  ngOnInit() {
    this.getPage();
  }

  getPage() {
    this.loading = true;
    this.oProductoService
      .getPage(this.nPage, this.nRpp, this.strField, this.strDir, this.strFiltro)
      .subscribe({
        next: (oPageFromServer: IPage<IProducto>) => {
          this.oPage = oPageFromServer;
          this.arrBotonera = this.oBotoneraService.getBotonera(
            this.nPage,
            oPageFromServer.totalPages
          );
          this.loading = false;
        },
        error: (err) => {
          console.error(err);
          this.loading = false;
        },
      });
  }

  edit(oProducto: IProducto) {
    this.oRouter.navigate(['admin/producto/edit', oProducto.id]);
  }

  view(oProducto: IProducto) {
    this.oRouter.navigate(['admin/producto/view', oProducto.id]);
  }

  remove(oProducto: IProducto) {
    this.oRouter.navigate(['admin/producto/delete', oProducto.id]);
  }

  goToPage(p: any) {
    const pageNumber = Number(p);
    if (!isNaN(pageNumber)) {
      this.nPage = pageNumber - 1;
      this.getPage();
    }
    return false;
  }

  goToNext() {
    if (this.oPage && this.nPage < this.oPage.totalPages - 1) {
      this.nPage++;
      this.getPage();
    }
    return false;
  }

  goToPrev() {
    if (this.nPage > 0) {
      this.nPage--;
      this.getPage();
    }
    return false;
  }

  sort(field: string) {
    this.strField = field;
    this.strDir = this.strDir === 'asc' ? 'desc' : 'asc';
    this.getPage();
  }

  goToRpp(nrpp: number) {
    this.nPage = 0;
    this.nRpp = nrpp;
    this.getPage();
    return false;
  }

  goToCustomPage() {
    const totalPages = this.oPage?.totalPages || 0;
    if (this.customPage > 0 && this.customPage <= totalPages) {
      this.nPage = this.customPage - 1;
      this.getPage();
    } else {
      alert(`Por favor, introduce un número de página entre 1 y ${totalPages}`);
    }
  }

  isInvalidCustomPage(): boolean {
    const totalPages = this.oPage?.totalPages ?? 1;
    return (
      this.customPage == null ||
      this.customPage < 1 ||
      this.customPage > totalPages
    );
  }

  filter(event: KeyboardEvent) {
    this.debounceSubject.next(this.strFiltro);
  }

  objectKeys(obj: Record<string, unknown>): string[] {
    return Object.keys(obj);
  }

  getValue(obj: Record<string, unknown>, key: string): unknown {
    return obj[key];
  }

  isVacio(valor: any): boolean {
    // Si es null o undefined
    if (valor === null || valor === undefined) {
      return true;
    }
  
    // Si es un string vacío o solo espacios
    if (typeof valor === 'string' && valor.trim() === '') {
      return true;
    }
  
    // Si es un array vacío
    if (Array.isArray(valor) && valor.length === 0) {
      return true;
    }
  
    // Si es un objeto vacío
    if (typeof valor === 'object' && !Array.isArray(valor) && Object.keys(valor).length === 0) {
      return true;
    }
  
    return false;
  }

  // ⭐️ Nueva función limpia para celda con valor faltante
  getCellClass(value: any): string {
    return this.isVacio(value) ? 'text-danger fw-bold bg-light-danger' : '';
  }

  getCellDisplay(value: any): string {
    return this.isVacio(value) ? 'Sin dato' : value;
  }
  
}
