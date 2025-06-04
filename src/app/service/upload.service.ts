import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UploadService {

constructor(private oHttp: HttpClient) { }


subirImagenAlServidor(file: File): Observable<string> {
  const formData = new FormData();
  formData.append('archivo', file);

  return this.oHttp.post<{ success: boolean, url: string }>(
    'https://proveedores.familycash.es/upload.php',
    formData
  ).pipe(
    map(response => {
      if (response.success) {
        return response.url;
      } else {
        throw new Error("Error al subir la imagen.");
      }
    })
  );
}

}
