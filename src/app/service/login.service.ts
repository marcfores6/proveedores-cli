import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { httpOptions, serverURL } from '../environment/environment';

@Injectable({
  providedIn: 'root'
})

export class LoginService {

  serverURL: string = serverURL + '/auth';

  constructor(private oHttp: HttpClient) { }

  login(nif: string, password: string, proveedorId: number) {
    const loginData = { nif, password, proveedorId };
    return this.oHttp.post<string>('http://localhost:8086/auth/login', loginData, { responseType: 'text' as 'json' });
  }
  
  getProveedoresPorNif(nif: string) {
    return this.oHttp.get<any[]>(`http://localhost:8086/auth/proveedores-por-nif?nif=${nif}`);
  }
  
}