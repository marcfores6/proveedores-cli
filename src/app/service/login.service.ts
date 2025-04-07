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

  login(nif: string, password: string): Observable<string> {
    const loginData = { nif: nif, password: password };
    return this.oHttp.post<string>(this.serverURL + '/login', loginData);
  }
}