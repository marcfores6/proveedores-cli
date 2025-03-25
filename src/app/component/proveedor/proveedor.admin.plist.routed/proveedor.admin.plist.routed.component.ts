import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TrimPipe } from '../../../pipe/trim.pipe';
import { debounceTime, Subject } from 'rxjs';
import { IPage } from '../../../model/model.interface';
import { IProveedor } from '../../../model/proveedor.interface';
import { BotoneraService } from '../../../service/botonera.service';
import { ProveedorService } from '../../../service/proveedor.service';
import { SessionService } from '../../../service/session.service';

@Component({
  selector: 'app-proveedor.admin.plist.routed',
  templateUrl: './proveedor.admin.plist.routed.component.html',
  styleUrls: ['./proveedor.admin.plist.routed.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, TrimPipe, RouterModule],
})
export class ProveedorAdminPlistRoutedComponent implements OnInit {
  oPage: IPage<IProveedor> | null = null;
  //
  nPage: number = 0; // 0-based server count
  nRpp: number = 10;
  //
  strField: string = '';
  strDir: string = '';
  //
  strFiltro: string = '';
  //
  arrBotonera: string[] = [];
  //
  private debounceSubject = new Subject<string>();


  constructor(
    private oProveedorService: ProveedorService,
    private oBotoneraService: BotoneraService,
    private oRouter: Router,
    private oSessionService: SessionService
  ) { 
    this.debounceSubject.pipe(debounceTime(300)).subscribe((value) => {
          this.getPage();
        });
  }

  ngOnInit() {
    this.getPage();
  }

  getPage() {
    this.oProveedorService
      .getPage(this.nPage, this.nRpp, this.strField, this.strDir, this.strFiltro)
      .subscribe({
        next: (oPageFromServer: IPage<IProveedor>) => {
          this.oPage = oPageFromServer;
          this.arrBotonera = this.oBotoneraService.getBotonera(
            this.nPage,
            oPageFromServer.totalPages
          );
        },
        error: (err) => {
          console.log(err);
        },
      });
  }

  edit(oProveedor: IProveedor) {
    //navegar a la página de edición
    this.oRouter.navigate(['admin/proveedor/edit', oProveedor.id]);
  }

  view(oProveedor: IProveedor) {
    //navegar a la página de edición
    this.oRouter.navigate(['admin/proveedor/view', oProveedor.id]);
  }

  remove(oProveedor: IProveedor) { 
    this.oRouter.navigate(['admin/proveedor/delete/', oProveedor.id]);
  }

  goToPage(p: any) {
    const pageNumber = Number(p); // Convertir el valor a número
    if (!isNaN(pageNumber)) {
      this.nPage = pageNumber - 1;
      this.getPage();
    }
    return false;
  }
  

  goToNext() {
    this.nPage++;
    this.getPage();
    return false;
  }

  goToPrev() {
    this.nPage--;
    this.getPage();
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

  filter(event: KeyboardEvent) {
    this.debounceSubject.next(this.strFiltro);
  }


}
