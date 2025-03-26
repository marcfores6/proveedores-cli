import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { serverURL, httpOptions } from '../environment/environment';
import { IPage } from '../model/model.interface';
import { IProveedor } from '../model/proveedor.interface';

@Injectable({
  providedIn: 'root'
})
export class ProveedorService {

  serverURL: string = serverURL + '/proveedor';

  constructor(private oHttp: HttpClient) {}

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

  create(formData: FormData): Observable<IProveedor> {
    let URL: string = '';
    URL += this.serverURL;
    return this.oHttp.post<IProveedor>('http://localhost:8086/proveedor/new', formData);
  }

  update(id: number, formData: FormData): Observable<IProveedor> {
    return this.oHttp.put<IProveedor>('http://localhost:8086/proveedor/update/' + id, formData);
  }

  getOne(id: number): Observable<IProveedor> {
    let URL: string = '';
    URL += 'http://localhost:8086';
    URL += '/proveedor';
    URL += '/' + id;
    return this.oHttp.get<IProveedor>(URL);
  }

  delete(id: number) {
    return this.oHttp.delete('http://localhost:8086/proveedor/delete/' + id);
  }

  getImagen(id: number): Observable<Blob> {
    return this.oHttp.get('http://localhost:8086/proveedor/'+ id +'/imagen', {
      responseType: 'blob',
    });
  }

  getProveedorByEmail(email: string): Observable<IProveedor> {
    let URL: string = '';
    URL += this.serverURL;
    URL += '/byemail';
    URL += '/' + email;
    return this.oHttp.get<IProveedor>(URL);
  }

}
