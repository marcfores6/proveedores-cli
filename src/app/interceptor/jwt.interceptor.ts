import { Injectable } from "@angular/core";
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpErrorResponse } from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";
import { Router } from "@angular/router";
import { SessionService } from "../service/session.service";

@Injectable()
export class JWTInterceptor implements HttpInterceptor {

    constructor(
        private oSessionService: SessionService,
        private router: Router
    ) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (this.oSessionService.isSessionActive()) {
            const token = this.oSessionService.getToken();
            if (token) {
                req = req.clone({
                    setHeaders: {
                        Authorization: `Bearer ${token}`
                    }
                });
            }
        }

        return next.handle(req).pipe(
            catchError((error: HttpErrorResponse) => {
                if (error.status === 401) {
                    console.warn('Token inválido o expirado, cerrando sesión...');
                    this.oSessionService.logout();
                    this.router.navigate(['/login']); // O la ruta que tengas para el login
                }
                return throwError(() => error);
            })
        );
    }
}