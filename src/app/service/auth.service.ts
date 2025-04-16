import { Injectable } from '@angular/core';
import {jwtDecode} from 'jwt-decode';
import { IJwt } from '../model/jwt.interface';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private tokenKey = 'auth-token';

  constructor(private oHttp: HttpClient) {}

  // Guarda el token en localStorage
  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  // Obtiene el token
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  // Decodifica el token para obtener los datos
  getDecodedToken(): IJwt | null {
    const token = this.getToken();
    if (!token) {
      return null;
    }

    try {
      return jwtDecode<IJwt>(token);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  // Comprueba si el usuario está autenticado
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    const decoded = this.getDecodedToken();
    return decoded !== null && decoded.exp * 1000 > Date.now();
  }

  // Comprueba si es ADMIN
  isAdmin(): boolean {
    const decoded = this.getDecodedToken();
    return decoded?.rol === 'ADMIN';
  }

  // Comprueba si es PROVEEDOR
  isProveedor(): boolean {
    const decoded = this.getDecodedToken();
    return decoded?.rol === 'PROVEEDOR';
  }

  // Elimina el token de la sesión
  logout(): void {
    localStorage.removeItem(this.tokenKey);
  }

  recuperarPassword(data: { nif: string; proveedorId: number }) {
    return this.oHttp.post<{ mensaje: string }>(
      'http://localhost:8086/proveedor/recuperar-password', // 👈 URL CORRECTA
      data
    );
  }
  
  addEmailToProveedor(proveedorId: number, email: string): Observable<any> {
    return this.oHttp.post(`http://localhost:8086/proveedor/}/add-email`, { proveedorId, email });
  }
  

}
