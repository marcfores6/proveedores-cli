import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TrimPipe } from '../../../pipe/trim.pipe';
import { Router, RouterModule } from '@angular/router';
import { ITipoProveedor } from '../../../model/tipoproveedor.interface';
import { IPage } from '../../../environment/model.interface';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { debounceTime, Subject } from 'rxjs';
import { BotoneraService } from '../../../service/botonera.service';
import { TipoproveedorService } from '../../../service/tipoproveedor.service';

@Component({
  selector: 'app-tipoproveedorselector',
  templateUrl: './tipoproveedorselector.component.html',
  styleUrls: ['./tipoproveedorselector.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, TrimPipe, RouterModule],
})
export class TipoProveedorSelectorComponent implements OnInit {

  oPage: IPage<ITipoProveedor> | null = null;
  //
  nPage: number = 0; // 0-based server count
  nRpp: number = 10;
  //
  strField: string = '';
  strDir: string = 'desc';
  //
  strFiltro: string = '';
  //
  arrBotonera: string[] = [];
  //
  private debounceSubject = new Subject<string>();
  //
  readonly dialogRef = inject(MatDialogRef<TipoProveedorSelectorComponent>);
  readonly data = inject(MAT_DIALOG_DATA);


  constructor(
    private oTipoProveedorService: TipoproveedorService,
    private oRouter: Router,
    private oBotoneraService: BotoneraService,
  ) { 
    this.debounceSubject.pipe(debounceTime(10)).subscribe((value) => {
      this.getPage();
    });
  }

  ngOnInit() {
    this.getPage();
  }

  getPage() {
    if (this.data.origen == "xproveedor"){
      this.oTipoProveedorService.getPageXProveedorNoTiene(
        this.nPage,
        this.nRpp,
        this.data.idProveedor
      ).subscribe({
        next: (oPageFromServer: IPage<ITipoProveedor>) => {
          this.oPage = oPageFromServer;
          this.arrBotonera = this.oBotoneraService.getBotonera(
            this.nPage,
            oPageFromServer.totalPages
          );
        },
        error: (err) => {
          console.log(err);
        },
      })
    } else {
    this.oTipoProveedorService
      .getPage(
        this.nPage,
        this.nRpp,
        this.strField,
        this.strDir,
        this.strFiltro
      )
      .subscribe({
        next: (oPageFromServer: IPage<ITipoProveedor>) => {
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
  }

 

  select(oTipoProveedor: ITipoProveedor) {
    
      // estamos en ventana emergente: no navegar
      // emitir el objeto seleccionado

      this.dialogRef.close(oTipoProveedor);


  }



  goToPage(p: number) {
    if (p) {
      this.nPage = p - 1;
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
