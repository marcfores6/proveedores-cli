import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IPage } from '../model/model.interface';
import { IProveedor } from '../model/proveedor.interface';
import { EntornoService } from './entorno.service';

@Injectable({
  providedIn: 'root'
})
export class ProveedorService {

  constructor(
    private oHttp: HttpClient,
    private entornoService: EntornoService
  ) { }

  private get serverURL(): string {
    return `${this.entornoService.getApiUrl()}/proveedor`;
  }

  getPage(page: number, size: number, field: string, dir: string, filtro: string): Observable<IPage<IProveedor>> {
    let URL = `${this.serverURL}?page=${page ?? 0}&size=${size ?? 10}`;
    if (field) URL += `&sort=${field},${dir === 'asc' ? 'asc' : 'desc'}`;
    if (filtro) URL += `&filter=${filtro}`;
    return this.oHttp.get<IPage<IProveedor>>(URL);
  }

  get(id: number): Observable<IProveedor> {
    return this.oHttp.get<IProveedor>(`${this.serverURL}/${id}`);
  }

  getOne(id: number): Observable<IProveedor> {
    return this.oHttp.get<IProveedor>(`${this.serverURL}/${id}`);
  }

  getProveedorByNif(nif: string): Observable<IProveedor> {
  const token = localStorage.getItem('token');
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`).set('X-Entorno', 'prod');;
  return this.oHttp.get<IProveedor>(`${this.entornoService.getApiUrl()}/proveedor/bynif/${nif}`, { headers });
}


  getProveedorFromToken(): Observable<IProveedor> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.oHttp.get<IProveedor>(`${this.serverURL}/bytoken`, { headers });
  }

  getAll(): Observable<IProveedor[]> {
    return this.oHttp.get<IProveedor[]>(`${this.serverURL}/all`);
  }

  getProveedoresPorNif(nif: string): Observable<IProveedor[]> {
    return this.oHttp.get<IProveedor[]>(`${this.entornoService.getApiUrl()}/auth/proveedores-por-nif?nif=${nif}`);
  }

  

}
