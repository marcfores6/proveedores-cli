import { Injectable } from '@angular/core';
import { httpOptions, serverURL } from '../environment/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IPage } from '../model/model.interface';
import { ITipoProducto } from '../model/tipoproducto.interface';

@Injectable({
  providedIn: 'root'
})
export class TipoproductoService {

    serverURL: string = serverURL + '/tipoproducto';

constructor(private oHttp: HttpClient) { }

getPage(
    page: number,
    size: number,
    field: string,
    dir: string,
    filtro: string
  ): Observable<IPage<ITipoProducto>> {
    let URL: string = '';
    URL += this.serverURL;
    if (!page) {
      page = 0;
    }
    URL += '?page=' + page;
    if (!size) {
      size = 10;
    }
    URL += '&size=' + size;
    if (field) {
      URL += '&sort=' + field;
      if (dir === 'asc') {
        URL += ',asc';
      } else {
        URL += ',desc';
      }
    }
    if (filtro) {
      URL += '&filter=' + filtro;
    }
    return this.oHttp.get<IPage<ITipoProducto>>(URL, httpOptions);
  }

  get(id: number): Observable<ITipoProducto> {
    let URL: string = '';
    URL += this.serverURL;
    URL += '/' + id;
    return this.oHttp.get<ITipoProducto>(URL);
  }

  create(oTipoProducto: ITipoProducto): Observable<ITipoProducto> {
    let URL: string = '';
    URL += this.serverURL;
    return this.oHttp.put<ITipoProducto>(URL, oTipoProducto);
  }

  update(oTipoProducto: ITipoProducto): Observable<ITipoProducto> {
    let URL: string = '';
    URL += this.serverURL;
    return this.oHttp.put<ITipoProducto>(URL, oTipoProducto);
  }

  getOne(id: number): Observable<ITipoProducto> {
    let URL: string = '';
    URL += this.serverURL;
    URL += '/' + id;
    return this.oHttp.get<ITipoProducto>(URL);
  }

  delete(id: number) {
    return this.oHttp.delete(this.serverURL + '/' + id);
  }

  getXProducto(id: number): Observable<ITipoProducto> {
    let URL: string = '';
    URL += this.serverURL;
    URL += '/xproducto/' + id;
    return this.oHttp.get<ITipoProducto>(URL);
  }


  getPageXProducto(
    page: number,
    size: number,
    id: number
  ): Observable<IPage<ITipoProducto>> {
    let URL: string = '';
    URL += this.serverURL;
    URL += '/xproducto/' + id;
    if (!page) {
      page = 0;
    }
    URL += '?page=' + page;
    if (!size) {
      size = 10;
    }
    URL += '&size=' + size;
    
    return this.oHttp.get<IPage<ITipoProducto>>(URL, httpOptions);
  }

  getPageXProductoNoTiene(
    page: number,
    size: number,
    id: number
  ): Observable<IPage<ITipoProducto>> {
    let URL: string = '';
    URL += this.serverURL;
    URL += '/xproductonotiene/' + id;
    if (!page) {
      page = 0;
    }
    URL += '?page=' + page;
    if (!size) {
      size = 10;
    }
    URL += '&size=' + size;
    
    return this.oHttp.get<IPage<ITipoProducto>>(URL, httpOptions);
  }


}
