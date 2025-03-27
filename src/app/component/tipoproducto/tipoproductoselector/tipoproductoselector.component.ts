import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RouterModule, Router } from '@angular/router';
import { Subject, debounceTime } from 'rxjs';
import { IPage } from '../../../model/model.interface';
import { ITipoProducto } from '../../../model/tipoproducto.interface';
import { TrimPipe } from '../../../pipe/trim.pipe';
import { BotoneraService } from '../../../service/botonera.service';
import { TipoproductoService } from '../../../service/tipoproducto.service';

@Component({
  selector: 'app-tipoproductoselector',
  templateUrl: './tipoproductoselector.component.html',
  styleUrls: ['./tipoproductoselector.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, TrimPipe, RouterModule],
})
export class TipoProductoSelectorComponent implements OnInit {

  oPage: IPage<ITipoProducto> | null = null;
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
  readonly dialogRef = inject(MatDialogRef<TipoProductoSelectorComponent>);
  readonly data = inject(MAT_DIALOG_DATA);


  constructor(
    private oTipoProductoService: TipoproductoService,
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
    if (this.data.origen == "xproducto"){
      this.oTipoProductoService.getPageXProductoNoTiene(
        this.nPage,
        this.nRpp,
        this.data.idProducto
      ).subscribe({
        next: (oPageFromServer: IPage<ITipoProducto>) => {
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
    this.oTipoProductoService
      .getPage(
        this.nPage,
        this.nRpp,
        this.strField,
        this.strDir,
        this.strFiltro
      )
      .subscribe({
        next: (oPageFromServer: IPage<ITipoProducto>) => {
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

 

  select(oTipoProducto: ITipoProducto) {
    
      // estamos en ventana emergente: no navegar
      // emitir el objeto seleccionado

      this.dialogRef.close(oTipoProducto);


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
