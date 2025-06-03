import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class EntornoService {

  private readonly STORAGE_KEY = 'entorno';
  private entornoSubject = new BehaviorSubject<'dev' | 'prod'>(this.getEntornoFromStorage());

  constructor(private router: Router) {}

  private getEntornoFromStorage(): 'dev' | 'prod' {
    const entorno = localStorage.getItem(this.STORAGE_KEY);
    return (entorno === 'dev' || entorno === 'prod') ? entorno : 'prod';
  }

  getEntorno(): 'dev' | 'prod' {
    return this.entornoSubject.value;
  }

  getEntorno$() {
    return this.entornoSubject.asObservable();
  }

  setEntorno(entorno: 'dev' | 'prod'): void {
    localStorage.setItem(this.STORAGE_KEY, entorno);
    this.entornoSubject.next(entorno);

    // 🔐 Seguridad: cerrar sesión y redirigir al login
    localStorage.removeItem('token');
    sessionStorage.clear();
    this.router.navigate(['/login'], { queryParams: { motivo: 'entorno' } });
  }

  getApiUrl(): string {
    return this.getEntorno() === 'dev'
      ? 'hhttps://proveedores-back-familycash.onrender.com'
      : 'https://proveedores-back-familycash.onrender.com'; // cambia si usas otro host en producción
  }
}
