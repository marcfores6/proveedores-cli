import { Injectable } from "@angular/core";
import { CanActivate, Router } from "@angular/router";
import { SessionService } from "../service/session.service";
import { map, Observable } from "rxjs";
import { ProveedorService } from "../service/proveedor.service";
import { IProveedor } from "../model/proveedor.interface";

@Injectable({
    providedIn: 'root'
})

export class AdminGuard implements CanActivate {

    constructor(private oSessionService: SessionService,
        private oProveedorService: ProveedorService,
        private oRouter: Router) { }

    canActivate(): Observable<boolean> {
        if (this.oSessionService.isSessionActive()) {
            let nif: string = this.oSessionService.getSessionNif();
            // llamar al servidor para obtener el rol del proveedor
            return this.oProveedorService.getSessionNif(nif).pipe(
                map((data: IProveedor) => {
                    if (data.tipoproveedor.descripcion === 'Cliente') {
                        return true;
                    } else {
                        this.oRouter.navigate(['/login']);
                        return false;
                    }
                })
            );        
        } else {
            this.oRouter.navigate(['/login']);
            return new Observable<boolean>(observer => {
                observer.next(false);
                observer.complete();
            });
        }
    }

}
