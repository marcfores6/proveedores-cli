import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Subject, debounceTime } from 'rxjs';
import { IPage } from '../../../model/model.interface';
import { IProducto } from '../../../model/producto.interface';
import { BotoneraService } from '../../../service/botonera.service';
import { ProductoService } from '../../../service/producto.service';
import { CommonModule } from '@angular/common';
import { FormGroup, FormsModule, FormBuilder } from '@angular/forms';
import { SessionService } from '../../../service/session.service';
import { ProveedorService } from '../../../service/proveedor.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-producto.admin.xproveedor.plist.routed',
  templateUrl: './producto.admin.xproveedor.plist.routed.component.html',
  styleUrls: ['./producto.admin.xproveedor.plist.routed.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
})
export class ProductoAdminXProveedorPlistRoutedComponent implements OnInit {

  oPage: IPage<IProducto> | null = null;
  nPage: number = 0;
  nRpp: number = 10;
  strField: string = '';
  strDir: string = '';
  strFiltro: string = '';
  arrBotonera: string[] = [];
  customPage: number = 1;
  loading: boolean = false;
  noArticulosMessage: string | null = null;
  proveedorDescripcion: string = '';
  showEnviarButton: boolean = false;
  productosParaEnviar: number = 0; // Número de productos listos para enviar
  form: FormGroup;

  private debounceSubject = new Subject<string>();

  constructor(
    private oProductoService: ProductoService,
    private oBotoneraService: BotoneraService,
    private oRouter: Router,
    private oSessionService: SessionService,
    private oProveedorService: ProveedorService,
    private fb: FormBuilder
  ) {
    this.debounceSubject.pipe(debounceTime(300)).subscribe(() => {
      this.getPage();
    });
    this.form = this.fb.group({}); // Formulario para cada producto
  }

  ngOnInit() {
    this.loadProveedorDescripcion();
    this.getPage();
  }

  getPage() {
    this.loading = true; // Iniciar el cargador
    this.oProductoService
      .getPageByProveedor(this.nPage, this.nRpp)
      .subscribe({
        next: (oPageFromServer: IPage<IProducto>) => {
          this.oPage = oPageFromServer;
          this.arrBotonera = this.oBotoneraService.getBotonera(
            this.nPage,
            oPageFromServer.totalPages
          );
          
          // Filtrar los productos que no tienen el estado 'ENVIADO'
          this.oPage.content = this.oPage.content.filter(producto => producto.estado !== 'ENVIADO');
          
          // Comprobar si todos los campos están completos
          this.oPage.content.forEach(producto => {
            // Verifica si todos los campos del producto están completos
            producto.showEnviarButton = this.checkIfAllFieldsAreFilled(producto);
          });
          
          if (this.oPage.content.length === 0) {
            this.noArticulosMessage = 'No tiene artículos'; // Si no hay productos
          } else {
            this.noArticulosMessage = null; // Resetear el mensaje si hay productos
          }
  
          this.loading = false; // Detener el cargador
        },
        error: (err) => {
          console.log(err);
          this.loading = false; // Detener el cargador en caso de error
        }
      });
  }
  
  
  



  checkIfAllFieldsAreFilled(product: IProducto): boolean {
    const requiredFields: (keyof IProducto)[] = [
      'descripcion', 'descripcionTic', 'departamento', 'familia', 'subfamilia', 'marca',
      'unidadDeMedida', 'cantidad', 'centralizado', 'apeso', 'unidadDeCaja', 'unidadDeServicio',
      'cajasCapa', 'cajasPalet', 'proveedor', 'referenciaProveedor', 'ean', 'ean_c', 'ean_p',
      'largo', 'ancho', 'alto', 'peso', 'diasCaducidad', 'iva', 'precioVenta', 'pvp_hom', 'pvp_and',
      'pvp_cat', 'precioTarifa', 'pro_fac', 'precioNeto', 'pro_ffac', 'pro_neton', 'art_mkd',
      'articuloSustituido', 'status', 'observaciones', 'partidaArancelaria', 'pvp_mel', 'paisOrigen'
    ];

    // Comprobamos si algún campo requerido está vacío
    return requiredFields.every(field => product[field] !== null && product[field] !== undefined && product[field] !== '');
  }



  checkCompleteFields(product: IProducto): boolean {
    // Comprobar si todos los campos necesarios están completos
    return Object.values(product).every(value => value !== null && value !== undefined && value !== '');
  }

  // Comprobar si se debe mostrar el botón de "Enviar"
  checkEnviarButtonVisibility(): void {
    this.showEnviarButton = this.productosParaEnviar > 0;
  }

  // Mostrar la notificación
  getNotificationMessage(): string {
    return this.productosParaEnviar > 0
      ? `¡Ya puedes enviar ${this.productosParaEnviar} producto(s)!`
      : '';
  }

  edit(oProducto: IProducto) {
    this.oRouter.navigate(['admin/producto/edit', oProducto.id]);
  }

  view(oProducto: IProducto) {
    this.oRouter.navigate(['admin/producto/view', oProducto.id]);
  }

  remove(oProducto: IProducto) {
    this.oRouter.navigate(['admin/producto/delete', oProducto.id]);
  }

  goToPage(p: any) {
    const pageNumber = Number(p);
    if (!isNaN(pageNumber)) {
      this.nPage = pageNumber - 1;
      this.getPage();
    }
    return false;
  }

  goToNext() {
    if (this.oPage && this.nPage < this.oPage.totalPages - 1) {
      this.nPage++;
      this.getPage();
    }
    return false;
  }

  goToPrev() {
    if (this.nPage > 0) {
      this.nPage--;
      this.getPage();
    }
    return false;
  }

  sort(field: string) {
    this.strField = field;
    this.strDir = this.strDir === 'asc' ? 'desc' : 'asc';
    this.getPage();
  }

  goToRpp(nrpp: number) {
    this.nPage = 0;
    this.nRpp = nrpp;
    this.getPage();
    return false;
  }

  goToCustomPage() {
    const totalPages = this.oPage?.totalPages || 0;
    if (this.customPage > 0 && this.customPage <= totalPages) {
      this.nPage = this.customPage - 1;
      this.getPage();
    } else {
      alert(`Por favor, introduce un número de página entre 1 y ${totalPages}`);
    }
  }

  isInvalidCustomPage(): boolean {
    const totalPages = this.oPage?.totalPages ?? 1;
    return (
      this.customPage == null ||
      this.customPage < 1 ||
      this.customPage > totalPages
    );
  }

  filter(event: KeyboardEvent) {
    this.debounceSubject.next(this.strFiltro);
  }

  objectKeys(obj: Record<string, unknown>): string[] {
    return Object.keys(obj);
  }

  getValue(obj: Record<string, unknown>, key: string): unknown {
    return obj[key];
  }

  isVacio(valor: any): boolean {
    return valor === null || valor === undefined || valor === '';
  }

  getCellClass(value: any): string {
    return this.isVacio(value) ? 'text-danger fw-bold bg-light-danger' : '';
  }

  loadProveedorDescripcion(): void {
    const proveedorId = this.oSessionService.getSessionProveedorId();

    if (proveedorId) {
      this.oProveedorService.get(Number(proveedorId)).subscribe({
        next: (proveedor) => {
          this.proveedorDescripcion = proveedor.descripcion || 'Proveedor';
        },
        error: (err) => {
          console.error('Error al cargar la descripción del proveedor', err);
          this.proveedorDescripcion = 'Proveedor';
        }
      });
    }
  }

  enviarProducto(producto: IProducto) {
    this.oProductoService.enviarProducto(producto.id).subscribe({
      next: (response: string) => {
        console.log('Respuesta del servidor:', response);
        alert(`Producto ${producto.descripcion} enviado exitosamente`);
  
        // Cambiar el estado del producto a "ENVIADO"
        producto.estado = 'ENVIADO';
  
        // Refrescar la lista de productos
        this.getPage();
      },
      error: (err: any) => {
        console.error('Error al enviar el producto:', err);
        alert('Hubo un problema al actualizar el producto.');
      }
    });
  }
  
  
  


}
