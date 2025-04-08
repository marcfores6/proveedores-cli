import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { httpOptions, serverURL } from '../environment/environment';
import { IPage } from '../model/model.interface';
import { IProveedor } from '../model/proveedor.interface';

@Injectable({
  providedIn: 'root'
})
export class ProveedorService {

  serverURL: string = serverURL + '/proveedor';

  constructor(private oHttp: HttpClient) { }

  getPage(
    page: number,
    size: number,
    field: string,
    dir: string,
    filtro: string
  ): Observable<IPage<IProveedor>> {
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
    return this.oHttp.get<IPage<IProveedor>>(URL, httpOptions);
  }


  get(id: number): Observable<IProveedor> {
    let URL: string = '';
    URL += this.serverURL;
    URL += '/' + id;
    return this.oHttp.get<IProveedor>(URL);
  }

  getOne(id: number): Observable<IProveedor> {
    let URL: string = '';
    URL += 'http://localhost:8086';
    URL += '/proveedor';
    URL += '/' + id;
    return this.oHttp.get<IProveedor>(URL);
  }

  getProveedorByNif(nif: string): Observable<IProveedor> {
    const token = localStorage.getItem('token'); // o sessionStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.oHttp.get<IProveedor>(`${this.serverURL}/bynif/${nif}`, { headers });
  }

  getProveedorFromToken(): Observable<IProveedor> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.oHttp.get<IProveedor>(`${this.serverURL}/bytoken`, { headers });
}


}
