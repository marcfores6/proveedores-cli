import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { httpOptions, serverURL } from '../environment/environment';
import { IProducto } from '../model/producto.interface';
import { Observable } from 'rxjs';
import { IPage } from '../model/model.interface';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  serverURL: string = serverURL + '/producto';

  constructor(private oHttp: HttpClient) { }

  getPage(
    page: number,
    size: number,
    field: string,
    dir: string,
    filtro: string
  ): Observable<IPage<IProducto>> {
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
    return this.oHttp.get<IPage<IProducto>>(URL, httpOptions);
  }

  getPageByProveedor(page: number, size: number): Observable<IPage<IProducto>> {
    return this.oHttp.get<IPage<IProducto>>(`${this.serverURL}/pagebyproveedor`, {
      params: { page: page.toString(), size: size.toString() }
    });
  }



  get(codigo: number): Observable<IProducto> {
    let URL: string = '';
    URL += this.serverURL;
    URL += '/' + codigo;
    return this.oHttp.get<IProducto>(URL);
  }

  create(formData: FormData): Observable<IProducto> {
    let URL: string = '';
    URL += this.serverURL;
    return this.oHttp.post<IProducto>('http://localhost:8086/producto/new', formData);
  }

  update(codigo: number, formData: FormData): Observable<IProducto> {
    return this.oHttp.put<IProducto>('http://localhost:8086/producto/update/' + codigo, formData);
  }
  

  getOne(codigo: number): Observable<IProducto> {
    let URL: string = '';
    URL += 'http://localhost:8086';
    URL += '/producto';
    URL += '/' + codigo;
    return this.oHttp.get<IProducto>(URL);
  }

  delete(codigo: number) {
    return this.oHttp.delete('http://localhost:8086/producto/delete/' + codigo);
  }

  getImagen(codigo: number): Observable<Blob> {
    return this.oHttp.get('http://localhost:8086/producto/' + codigo + '/imagen', {
      responseType: 'blob',
    });
  }

  deleteImagen(codigo: number): Observable<any> {
    return this.oHttp.delete('http://localhost:8086/producto/imagen/' + codigo);
  }

  // 🔥 Subir nuevos documentos PDF
  uploadDocumentos(codigo: number, documentos: File[], tipos: string[]): Observable<IProducto> {
    const formData = new FormData();
  
    documentos.forEach((documento, i) => {
      formData.append('documentos', documento);
      formData.append('tiposDocumentos', tipos[i]); // importante
    });
  
    return this.oHttp.put<IProducto>(
      `http://localhost:8086/producto/update/${codigo}`, 
      formData
    );
  }
  

  // 🔥 Eliminar un documento PDF existente
  deleteDocumento(idDocumento: number): Observable<any> {
    return this.oHttp.delete('http://localhost:8086/producto/documento/' + idDocumento);
  }

  enviarProducto(id: number): Observable<any> {
    return this.oHttp.put('http://localhost:8086/producto/' + id + '/enviar', {}, { responseType: 'text' });
  }
  
  
}
