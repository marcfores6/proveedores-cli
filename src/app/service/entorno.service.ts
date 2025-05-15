import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EntornoService {

  private readonly STORAGE_KEY = 'entorno';
  private entornoSubject = new BehaviorSubject<'dev' | 'prod'>(this.getEntornoFromStorage());

  constructor() {}

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
    this.entornoSubject.next(entorno); // 🔄 Emite el cambio a los suscriptores
  }

  getApiUrl(): string {
    return this.getEntorno() === 'dev'
      ? 'http://localhost:8086'
      : 'http://localhost:8086'; // cambia aquí si usas otro host en producción
  }
}
