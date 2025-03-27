import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { httpOptions, serverURL } from '../environment/environment';
import { ITipoProveedor } from '../model/tipoproveedor.interface';
import { IPage } from '../environment/model.interface';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TipoproveedorService {

  serverURL: string = serverURL + '/tipoproveedor';

  constructor(private oHttp: HttpClient) {}

  getPage(
    page: number,
    size: number,
    field: string,
    dir: string,
    filtro: string
  ): Observable<IPage<ITipoProveedor>> {
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
    return this.oHttp.get<IPage<ITipoProveedor>>(URL, httpOptions);
  }

  get(id: number): Observable<ITipoProveedor> {
    let URL: string = '';
    URL += this.serverURL;
    URL += '/' + id;
    return this.oHttp.get<ITipoProveedor>(URL);
  }

  create(oTipoProveedor: ITipoProveedor): Observable<ITipoProveedor> {
    let URL: string = '';
    URL += this.serverURL;
    return this.oHttp.put<ITipoProveedor>(URL, oTipoProveedor);
  }

  update(oTipoProveedor: ITipoProveedor): Observable<ITipoProveedor> {
    let URL: string = '';
    URL += this.serverURL;
    return this.oHttp.put<ITipoProveedor>(URL, oTipoProveedor);
  }

  getOne(id: number): Observable<ITipoProveedor> {
    let URL: string = '';
    URL += this.serverURL;
    URL += '/' + id;
    return this.oHttp.get<ITipoProveedor>(URL);
  }

  delete(id: number) {
    return this.oHttp.delete(this.serverURL + '/' + id);
  }

  getXProveedor(id: number): Observable<ITipoProveedor> {
    let URL: string = '';
    URL += this.serverURL;
    URL += '/xproveedor/' + id;
    return this.oHttp.get<ITipoProveedor>(URL);
  }


  getPageXProveedor(
    page: number,
    size: number,
    id: number
  ): Observable<IPage<ITipoProveedor>> {
    let URL: string = '';
    URL += this.serverURL;
    URL += '/xproveedor/' + id;
    if (!page) {
      page = 0;
    }
    URL += '?page=' + page;
    if (!size) {
      size = 10;
    }
    URL += '&size=' + size;
    
    return this.oHttp.get<IPage<ITipoProveedor>>(URL, httpOptions);
  }

  getPageXProveedorNoTiene(
    page: number,
    size: number,
    id: number
  ): Observable<IPage<ITipoProveedor>> {
    let URL: string = '';
    URL += this.serverURL;
    URL += '/xproveedornotiene/' + id;
    if (!page) {
      page = 0;
    }
    URL += '?page=' + page;
    if (!size) {
      size = 10;
    }
    URL += '&size=' + size;
    
    return this.oHttp.get<IPage<ITipoProveedor>>(URL, httpOptions);
  }

}
