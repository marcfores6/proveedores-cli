import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { EntornoService } from '../service/entorno.service';

@Injectable()
export class EntornoInterceptor implements HttpInterceptor {

  constructor(private entornoService: EntornoService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const entorno = this.entornoService.getEntorno();
    const modifiedReq = req.clone({
      setHeaders: {
        'X-Entorno': entorno
      }
    });
    return next.handle(modifiedReq);
  }
}
