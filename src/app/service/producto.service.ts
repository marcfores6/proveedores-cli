import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IPage } from '../model/model.interface';
import { IProducto } from '../model/producto.interface';
import { EntornoService } from './entorno.service';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {

  constructor(
    private oHttp: HttpClient,
    private entornoService: EntornoService
  ) { }

  private get serverURL(): string {
    return `${this.entornoService.getApiUrl()}/producto`;
  }

  getPage(page: number, size: number, field: string, dir: string, filtro: string): Observable<IPage<IProducto>> {
    let URL = `${this.serverURL}?page=${page ?? 0}&size=${size ?? 10}`;
    if (field) URL += `&sort=${field},${dir === 'asc' ? 'asc' : 'desc'}`;
    if (filtro) URL += `&filter=${filtro}`;
    return this.oHttp.get<IPage<IProducto>>(URL);
  }

  getPageByProveedor(page: number, size: number): Observable<IPage<IProducto>> {
    return this.oHttp.get<IPage<IProducto>>(`${this.serverURL}/pagebyproveedor`, {
      params: { page: page.toString(), size: size.toString() }
    });
  }

  get(codigo: number): Observable<IProducto> {
    return this.oHttp.get<IProducto>(`${this.serverURL}/${codigo}`);
  }

  getOne(codigo: number): Observable<IProducto> {
    return this.oHttp.get<IProducto>(`${this.serverURL}/${codigo}`);
  }

  create(formData: FormData): Observable<IProducto> {
    return this.oHttp.post<IProducto>(`${this.serverURL}/new`, formData);
  }

  update(codigo: number, formData: FormData): Observable<IProducto> {
    return this.oHttp.put<IProducto>(`${this.serverURL}/update/${codigo}`, formData);
  }

  delete(id: number): Observable<any> {
    return this.oHttp.delete(`${this.serverURL}/${id}`, { responseType: 'text' });
  }

  getImagen(codigo: number): Observable<Blob> {
    return this.oHttp.get(`${this.serverURL}/${codigo}/imagen`, {
      responseType: 'blob',
    });
  }

  deleteImagen(codigo: number): Observable<any> {
    return this.oHttp.delete(`${this.serverURL}/imagen/${codigo}`);
  }

  uploadDocumentos(codigo: number, documentos: File[], tipos: string[]): Observable<IProducto> {
    const formData = new FormData();
    documentos.forEach((doc, i) => {
      formData.append('documentos', doc);
      formData.append('tiposDocumentos', tipos[i]);
    });
    return this.oHttp.put<IProducto>(`${this.serverURL}/update/${codigo}`, formData);
  }

  deleteDocumento(idDocumento: number): Observable<any> {
    return this.oHttp.delete(`${this.serverURL}/documento/${idDocumento}`);
  }

  enviarProducto(id: number): Observable<any> {
    return this.oHttp.put(`${this.serverURL}/${id}/enviar`, {}, { responseType: 'text' });
  }

}
