import { inject, Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { IJwt } from "../model/jwt.interface";
import { jwtDecode } from "jwt-decode";


@Injectable({
    providedIn: 'root'
})

export class SessionService {    

    subjectLogin: Subject<void> = new Subject<void>();
    subjectLogout: Subject<void> = new Subject<void>();

    public getToken(): string | null {
        return localStorage.getItem('token');
    }

    private deleteToken(): void {
        localStorage.removeItem('token');
    }

    isSessionActive(): boolean {
        // comprobar si el token no ha expirado
        const token = this.getToken();
        if (token) {
            let parsedToken: IJwt;
            parsedToken = this.parseJwt(token);
            const now = Date.now() / 1000;
            if (parsedToken.exp > now) {
                return true;
            } else {
                this.deleteToken();
                return false;
            }
        } else {
            return false;
        }
    }

    getSessionNif(): string {
        const token = this.getToken();
        if (token) {
            if (this.isSessionActive()) {
                let parsedToken: IJwt;
                parsedToken = this.parseJwt(token);
                return parsedToken.nif;
            } else {
                return '';
            }
        } else {
            return '';
        }
    }

    getSessionId(): string {
        const token = this.getToken();
        if (token) {
            if (this.isSessionActive()) {
                let parsedToken: IJwt;
                parsedToken = this.parseJwt(token);
                return parsedToken.id;
            } else {
                return '';
            }
        } else {
            return '';
        }
    }

    getSessionProveedorId(): string {
        const token = this.getToken();
        if (token && this.isSessionActive()) {
          const parsedToken = this.parseJwt(token);
          return parsedToken.proveedorId; // Devuelve el proveedorId o una cadena vacía si no existe
        }
        return '';
      }
      

    private parseJwt(token: string): IJwt {
        var base64Url = token.split('.')[1];
        var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    }

    onLogin(): Subject<void> {
        return this.subjectLogin;
    }

    onLogout(): Subject<void> {
        return this.subjectLogout;
    }

    private setToken(strToken: string): void {
        const cleanToken = strToken.replace(/^"|"$/g, ''); // Esto quita las comillas al principio y al final
        localStorage.setItem('token', cleanToken);
    }
    

    login(strToken: string): void {
        this.setToken(strToken);
        this.subjectLogin.next();
    }

    logout(): void {
        this.deleteToken();
        this.subjectLogout.next();
    }

    getSessionRol(): string {
        const token = this.getToken();
        if (!token) return '';
        try {
          const decoded: any = jwtDecode(token);
          return decoded.rol || '';
        } catch {
          return '';
        }
      }

}