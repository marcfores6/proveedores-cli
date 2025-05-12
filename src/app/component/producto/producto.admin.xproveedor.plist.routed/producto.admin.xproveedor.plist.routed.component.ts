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

declare var bootstrap: any; // Para usar Bootstrap en TypeScript

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
  enviandoProductos: boolean = false;

  confirmMessage: string = '';
  accionConfirmada: Function = () => { };
  confirmModal: any;
  form: FormGroup;

  productosFiltrados: IProducto[] = [];
  productoPendiente: any = null;

  message: string = '';
  myModal: any;

  paisesList: { id: number; nombre: string; codigo: string }[] = [];

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
    this.cargarPaises(); // <- primero
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
          this.productosFiltrados = oPageFromServer.content
          .filter(producto => producto.estado !== 'ENVIADO')
          .filter(producto =>
            !this.strFiltro ||
            producto.descripcion?.toLowerCase().includes(this.strFiltro.toLowerCase())
          );
        

          this.productosFiltrados.forEach(producto => {
            producto.showEnviarButton = this.checkIfAllFieldsAreFilled(producto);
          });

          this.productosParaEnviar = this.productosFiltrados.filter(p => p.showEnviarButton).length;


          if (this.productosFiltrados.length === 0) {
            this.noArticulosMessage = 'No hay productos pendientes por enviar.';
          } else {
            this.noArticulosMessage = null;
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
    'descripcion', 'marca',
    'unidadDeMedida', 'centralizado', 'unidadDeCaja',
    'unidadDePack',
    'cajasCapa', 'cajasPalet', 'proveedor', 'referenciaProveedor',
    'ean', 'ean_caja', 'ean_pack',
    'largo_caja', 'ancho_caja', 'alto_caja', 'peso_caja',
    'largo_unidad', 'ancho_unidad', 'alto_unidad',
    'peso_neto_unidad', 'peso_escurrido_unidad',
    'diasCaducidad', 'iva', 'observaciones',
    'partidaArancelaria', 'leadtime', 'paisOrigen'
  ];

  return requiredFields.every(field => {
    // Excepción especial: si unidadDeCaja es 1, se permite unidadDePack nulo
    if (field === 'unidadDePack') {
      if (product.unidadDeCaja === 1) {
        return true;
      }
    }
    const value = product[field];
    return value !== null && value !== undefined && value !== '';
  });
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

  getCellClass(valor: any): string {
    if (valor === null || valor === undefined) return 'text-danger fw-bold';
  
    if (typeof valor === 'string') {
      const trimmed = valor.trim();
      return trimmed === '' ? 'text-danger fw-bold' : '';
    }
  
    return '';
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
        this.showModal(`Producto ${producto.descripcion} enviado exitosamente`);

        // Cambiar el estado del producto a "ENVIADO"
        producto.estado = 'ENVIADO';

        // Refrescar la lista de productos
        this.getPage();
      },
      error: (err: any) => {
        console.error('Error al enviar el producto:', err);
        this.showModal('Hubo un problema al actualizar el producto.');
      }
    });
  }

  showModal(mensaje: string) {
    this.message = mensaje;
    const modalElement = document.getElementById('mimodal');
    if (modalElement) {
      this.myModal = new bootstrap.Modal(modalElement, {
        keyboard: false,
      });
      this.myModal.show();
    }
  }

  hideModal = () => {
    this.myModal?.hide();
    this.getPage(); // o navega o recarga si quieres
  };


  enviarTodosProductos() {
    if (!this.productosFiltrados || this.productosFiltrados.length === 0) return;

    const productosAEnviar = this.productosFiltrados.filter(producto => producto.showEnviarButton);

    if (productosAEnviar.length === 0) {
      this.showModal('No hay productos listos para enviar.');
      return;
    }

    this.enviandoProductos = true;

    let enviados = 0;
    let errores = 0;
    const total = productosAEnviar.length;

    productosAEnviar.forEach((producto) => {
      this.oProductoService.enviarProducto(producto.id).subscribe({
        next: () => {
          enviados++;
          producto.estado = 'ENVIADO';
          producto.showEnviarButton = false;
          this.checkIfAllFinished(enviados, errores, total);
        },
        error: () => {
          errores++;
          this.checkIfAllFinished(enviados, errores, total);
        }
      });
    });
  }

  checkIfAllFinished(enviados: number, errores: number, total: number) {
    if (enviados + errores === total) {
      this.enviandoProductos = false;
      this.showModal(
        `Se han enviado ${enviados} producto(s) correctamente${errores > 0 ? ` y ${errores} con error` : ''}.`
      );
      this.getPage();
    }
  }

  mostrarConfirmacion(mensaje: string, accion: () => void): void {
    this.confirmMessage = mensaje;
    this.accionConfirmada = accion;
    setTimeout(() => {
      this.confirmModal = new bootstrap.Modal(document.getElementById('confirmModal'), {
        keyboard: false,
      });
      this.confirmModal.show();
    }, 0);
  }


  // Ejecutar acción confirmada
  confirmarAccion(): void {
    this.confirmModal.hide();
    if (this.accionConfirmada) {
      this.accionConfirmada();
    }
  }

  confirmarEnviarProducto(producto: any): void {
    this.productoPendiente = producto;
    this.mostrarConfirmacion(
      `¿Estás seguro de que deseas enviar el producto '${producto.descripcion}'?`,
      this.enviarProductoConfirmado.bind(this)
    );
  }

  enviarProductoConfirmado(): void {
    if (this.productoPendiente) {
      this.enviarProducto(this.productoPendiente);
      this.productoPendiente = null;
    }
  }

  confirmarEnviarTodos(): void {
    this.mostrarConfirmacion(
      '¿Quieres enviar todos los productos listos?',
      this.enviarTodosProductos.bind(this)
    );
  }

  getIvaTexto(valor: string | number | undefined): string {
    const ivaNum = Number(valor);
    switch (ivaNum) {
      case 1: return '4%';
      case 2: return '10%';
      case 3: return '21%';
      default: return 'Sin dato';
    }
  }
  

  getPaisTexto(codigo: string | number | undefined): string {
    if (!codigo || typeof codigo !== 'string') return 'Sin dato';
  
    const pais = this.paisesList.find(p => p.codigo === codigo);
    return pais ? pais.nombre : 'Sin dato';
  }
  

  getCellClassCodigoPais(codigo: string | undefined | null): string {
    if (!codigo || typeof codigo !== 'string' || codigo.trim() === '') {
      return 'text-danger fw-bold';
    }
  
    const encontrado = this.paisesList.find(p => p.codigo === codigo);
    return encontrado ? '' : 'text-danger fw-bold'; // si no existe el código, marcar en rojo
  }

  getCellClassUnidadDePack(producto: IProducto): string {
    const unidadDePack = producto.unidadDePack;
    const unidadDeCaja = producto.unidadDeCaja;
  
    // Si unidadDeCaja es 1, permitir que unidadDePack sea nulo
    if ((unidadDeCaja === 1) && (unidadDePack === null || unidadDePack === undefined )) {
      return ''; // No marcar en rojo
    }
  
    // Si unidadDePack es nulo en cualquier otro caso, marcarlo en rojo
    return this.getCellClass(unidadDePack);
  }
  
  

  cargarPaises(): void {
    this.paisesList = [{
      "id": 1,
      "nombre": "Aruba",
      "codigo": "ABW"
    },
    {
      "id": 2,
      "nombre": "Afghanistan",
      "codigo": "AFG"
    },
    {
      "id": 3,
      "nombre": "Angola",
      "codigo": "AGO"
    },
    {
      "id": 4,
      "nombre": "Anguilla",
      "codigo": "AIA"
    },
    {
      "id": 5,
      "nombre": "Åland Islands",
      "codigo": "ALA"
    },
    {
      "id": 6,
      "nombre": "Albania",
      "codigo": "ALB"
    },
    {
      "id": 7,
      "nombre": "Andorra",
      "codigo": "AND"
    },
    {
      "id": 8,
      "nombre": "United Arab Emirates",
      "codigo": "ARE"
    },
    {
      "id": 9,
      "nombre": "Argentina",
      "codigo": "ARG"
    },
    {
      "id": 10,
      "nombre": "Armenia",
      "codigo": "ARM"
    },
    {
      "id": 11,
      "nombre": "American Samoa",
      "codigo": "ASM"
    },
    {
      "id": 12,
      "nombre": "Antarctica",
      "codigo": "ATA"
    },
    {
      "id": 13,
      "nombre": "French Southern Territories",
      "codigo": "ATF"
    },
    {
      "id": 14,
      "nombre": "Antigua and Barbuda",
      "codigo": "ATG"
    },
    {
      "id": 15,
      "nombre": "Australia",
      "codigo": "AUS"
    },
    {
      "id": 16,
      "nombre": "Austria",
      "codigo": "AUT"
    },
    {
      "id": 17,
      "nombre": "Azerbaijan",
      "codigo": "AZE"
    },
    {
      "id": 18,
      "nombre": "Burundi",
      "codigo": "BDI"
    },
    {
      "id": 19,
      "nombre": "Belgium",
      "codigo": "BEL"
    },
    {
      "id": 20,
      "nombre": "Benin",
      "codigo": "BEN"
    },
    {
      "id": 21,
      "nombre": "Bonaire, Sint Eustatius and Saba",
      "codigo": "BES"
    },
    {
      "id": 22,
      "nombre": "Burkina Faso",
      "codigo": "BFA"
    },
    {
      "id": 23,
      "nombre": "Bangladesh",
      "codigo": "BGD"
    },
    {
      "id": 24,
      "nombre": "Bulgaria",
      "codigo": "BGR"
    },
    {
      "id": 25,
      "nombre": "Bahrain",
      "codigo": "BHR"
    },
    {
      "id": 26,
      "nombre": "Bahamas",
      "codigo": "BHS"
    },
    {
      "id": 27,
      "nombre": "Bosnia and Herzegovina",
      "codigo": "BIH"
    },
    {
      "id": 28,
      "nombre": "Saint Barthélemy",
      "codigo": "BLM"
    },
    {
      "id": 29,
      "nombre": "Belarus",
      "codigo": "BLR"
    },
    {
      "id": 30,
      "nombre": "Belize",
      "codigo": "BLZ"
    },
    {
      "id": 31,
      "nombre": "Bermuda",
      "codigo": "BMU"
    },
    {
      "id": 32,
      "nombre": "Bolivia, Plurinational State of",
      "codigo": "BOL"
    },
    {
      "id": 33,
      "nombre": "Brazil",
      "codigo": "BRA"
    },
    {
      "id": 34,
      "nombre": "Barbados",
      "codigo": "BRB"
    },
    {
      "id": 35,
      "nombre": "Brunei Darussalam",
      "codigo": "BRN"
    },
    {
      "id": 36,
      "nombre": "Bhutan",
      "codigo": "BTN"
    },
    {
      "id": 37,
      "nombre": "Bouvet Island",
      "codigo": "BVT"
    },
    {
      "id": 38,
      "nombre": "Botswana",
      "codigo": "BWA"
    },
    {
      "id": 39,
      "nombre": "Central African Republic",
      "codigo": "CAF"
    },
    {
      "id": 40,
      "nombre": "Canada",
      "codigo": "CAN"
    },
    {
      "id": 41,
      "nombre": "Cocos (Keeling) Islands",
      "codigo": "CCK"
    },
    {
      "id": 42,
      "nombre": "Switzerland",
      "codigo": "CHE"
    },
    {
      "id": 43,
      "nombre": "Chile",
      "codigo": "CHL"
    },
    {
      "id": 44,
      "nombre": "China",
      "codigo": "CHN"
    },
    {
      "id": 45,
      "nombre": "Côte d'Ivoire",
      "codigo": "CIV"
    },
    {
      "id": 46,
      "nombre": "Cameroon",
      "codigo": "CMR"
    },
    {
      "id": 47,
      "nombre": "Congo, The Democratic Republic of the",
      "codigo": "COD"
    },
    {
      "id": 48,
      "nombre": "Congo",
      "codigo": "COG"
    },
    {
      "id": 49,
      "nombre": "Cook Islands",
      "codigo": "COK"
    },
    {
      "id": 50,
      "nombre": "Colombia",
      "codigo": "COL"
    },
    {
      "id": 51,
      "nombre": "Comoros",
      "codigo": "COM"
    },
    {
      "id": 52,
      "nombre": "Cabo Verde",
      "codigo": "CPV"
    },
    {
      "id": 53,
      "nombre": "Costa Rica",
      "codigo": "CRI"
    },
    {
      "id": 54,
      "nombre": "Cuba",
      "codigo": "CUB"
    },
    {
      "id": 55,
      "nombre": "Curaçao",
      "codigo": "CUW"
    },
    {
      "id": 56,
      "nombre": "Christmas Island",
      "codigo": "CXR"
    },
    {
      "id": 57,
      "nombre": "Cayman Islands",
      "codigo": "CYM"
    },
    {
      "id": 58,
      "nombre": "Cyprus",
      "codigo": "CYP"
    },
    {
      "id": 59,
      "nombre": "Czechia",
      "codigo": "CZE"
    },
    {
      "id": 60,
      "nombre": "Germany",
      "codigo": "DEU"
    },
    {
      "id": 61,
      "nombre": "Djibouti",
      "codigo": "DJI"
    },
    {
      "id": 62,
      "nombre": "Dominica",
      "codigo": "DMA"
    },
    {
      "id": 63,
      "nombre": "Denmark",
      "codigo": "DNK"
    },
    {
      "id": 64,
      "nombre": "Dominican Republic",
      "codigo": "DOM"
    },
    {
      "id": 65,
      "nombre": "Algeria",
      "codigo": "DZA"
    },
    {
      "id": 66,
      "nombre": "Ecuador",
      "codigo": "ECU"
    },
    {
      "id": 67,
      "nombre": "Egypt",
      "codigo": "EGY"
    },
    {
      "id": 68,
      "nombre": "Eritrea",
      "codigo": "ERI"
    },
    {
      "id": 69,
      "nombre": "Western Sahara",
      "codigo": "ESH"
    },
    {
      "id": 70,
      "nombre": "España",
      "codigo": "ESP"
    },
    {
      "id": 71,
      "nombre": "Estonia",
      "codigo": "EST"
    },
    {
      "id": 72,
      "nombre": "Ethiopia",
      "codigo": "ETH"
    },
    {
      "id": 73,
      "nombre": "Finland",
      "codigo": "FIN"
    },
    {
      "id": 74,
      "nombre": "Fiji",
      "codigo": "FJI"
    },
    {
      "id": 75,
      "nombre": "Falkland Islands (Malvinas)",
      "codigo": "FLK"
    },
    {
      "id": 76,
      "nombre": "France",
      "codigo": "FRA"
    },
    {
      "id": 77,
      "nombre": "Faroe Islands",
      "codigo": "FRO"
    },
    {
      "id": 78,
      "nombre": "Micronesia, Federated States of",
      "codigo": "FSM"
    },
    {
      "id": 79,
      "nombre": "Gabon",
      "codigo": "GAB"
    },
    {
      "id": 80,
      "nombre": "United Kingdom",
      "codigo": "GBR"
    },
    {
      "id": 81,
      "nombre": "Georgia",
      "codigo": "GEO"
    },
    {
      "id": 82,
      "nombre": "Guernsey",
      "codigo": "GGY"
    },
    {
      "id": 83,
      "nombre": "Ghana",
      "codigo": "GHA"
    },
    {
      "id": 84,
      "nombre": "Gibraltar",
      "codigo": "GIB"
    },
    {
      "id": 85,
      "nombre": "Guinea",
      "codigo": "GIN"
    },
    {
      "id": 86,
      "nombre": "Guadeloupe",
      "codigo": "GLP"
    },
    {
      "id": 87,
      "nombre": "Gambia",
      "codigo": "GMB"
    },
    {
      "id": 88,
      "nombre": "Guinea-Bissau",
      "codigo": "GNB"
    },
    {
      "id": 89,
      "nombre": "Equatorial Guinea",
      "codigo": "GNQ"
    },
    {
      "id": 90,
      "nombre": "Greece",
      "codigo": "GRC"
    },
    {
      "id": 91,
      "nombre": "Grenada",
      "codigo": "GRD"
    },
    {
      "id": 92,
      "nombre": "Greenland",
      "codigo": "GRL"
    },
    {
      "id": 93,
      "nombre": "Guatemala",
      "codigo": "GTM"
    },
    {
      "id": 94,
      "nombre": "French Guiana",
      "codigo": "GUF"
    },
    {
      "id": 95,
      "nombre": "Guam",
      "codigo": "GUM"
    },
    {
      "id": 96,
      "nombre": "Guyana",
      "codigo": "GUY"
    },
    {
      "id": 97,
      "nombre": "Hong Kong",
      "codigo": "HKG"
    },
    {
      "id": 98,
      "nombre": "Heard Island and McDonald Islands",
      "codigo": "HMD"
    },
    {
      "id": 99,
      "nombre": "Honduras",
      "codigo": "HND"
    },
    {
      "id": 100,
      "nombre": "Croatia",
      "codigo": "HRV"
    },
    {
      "id": 101,
      "nombre": "Haiti",
      "codigo": "HTI"
    },
    {
      "id": 102,
      "nombre": "Hungary",
      "codigo": "HUN"
    },
    {
      "id": 103,
      "nombre": "Indonesia",
      "codigo": "IDN"
    },
    {
      "id": 104,
      "nombre": "Isle of Man",
      "codigo": "IMN"
    },
    {
      "id": 105,
      "nombre": "India",
      "codigo": "IND"
    },
    {
      "id": 106,
      "nombre": "British Indian Ocean Territory",
      "codigo": "IOT"
    },
    {
      "id": 107,
      "nombre": "Ireland",
      "codigo": "IRL"
    },
    {
      "id": 108,
      "nombre": "Iran, Islamic Republic of",
      "codigo": "IRN"
    },
    {
      "id": 109,
      "nombre": "Iraq",
      "codigo": "IRQ"
    },
    {
      "id": 110,
      "nombre": "Iceland",
      "codigo": "ISL"
    },
    {
      "id": 111,
      "nombre": "Israel",
      "codigo": "ISR"
    },
    {
      "id": 112,
      "nombre": "Italy",
      "codigo": "ITA"
    },
    {
      "id": 113,
      "nombre": "Jamaica",
      "codigo": "JAM"
    },
    {
      "id": 114,
      "nombre": "Jersey",
      "codigo": "JEY"
    },
    {
      "id": 115,
      "nombre": "Jordan",
      "codigo": "JOR"
    },
    {
      "id": 116,
      "nombre": "Japan",
      "codigo": "JPN"
    },
    {
      "id": 117,
      "nombre": "Kazakhstan",
      "codigo": "KAZ"
    },
    {
      "id": 118,
      "nombre": "Kenya",
      "codigo": "KEN"
    },
    {
      "id": 119,
      "nombre": "Kyrgyzstan",
      "codigo": "KGZ"
    },
    {
      "id": 120,
      "nombre": "Cambodia",
      "codigo": "KHM"
    },
    {
      "id": 121,
      "nombre": "Kiribati",
      "codigo": "KIR"
    },
    {
      "id": 122,
      "nombre": "Saint Kitts and Nevis",
      "codigo": "KNA"
    },
    {
      "id": 123,
      "nombre": "Korea, Republic of",
      "codigo": "KOR"
    },
    {
      "id": 124,
      "nombre": "Kuwait",
      "codigo": "KWT"
    },
    {
      "id": 125,
      "nombre": "Lao People's Democratic Republic",
      "codigo": "LAO"
    },
    {
      "id": 126,
      "nombre": "Lebanon",
      "codigo": "LBN"
    },
    {
      "id": 127,
      "nombre": "Liberia",
      "codigo": "LBR"
    },
    {
      "id": 128,
      "nombre": "Libya",
      "codigo": "LBY"
    },
    {
      "id": 129,
      "nombre": "Saint Lucia",
      "codigo": "LCA"
    },
    {
      "id": 130,
      "nombre": "Liechtenstein",
      "codigo": "LIE"
    },
    {
      "id": 131,
      "nombre": "Sri Lanka",
      "codigo": "LKA"
    },
    {
      "id": 132,
      "nombre": "Lesotho",
      "codigo": "LSO"
    },
    {
      "id": 133,
      "nombre": "Lithuania",
      "codigo": "LTU"
    },
    {
      "id": 134,
      "nombre": "Luxembourg",
      "codigo": "LUX"
    },
    {
      "id": 135,
      "nombre": "Latvia",
      "codigo": "LVA"
    },
    {
      "id": 136,
      "nombre": "Macao",
      "codigo": "MAC"
    },
    {
      "id": 137,
      "nombre": "Saint Martin (French part)",
      "codigo": "MAF"
    },
    {
      "id": 138,
      "nombre": "Morocco",
      "codigo": "MAR"
    },
    {
      "id": 139,
      "nombre": "Monaco",
      "codigo": "MCO"
    },
    {
      "id": 140,
      "nombre": "Moldova, Republic of",
      "codigo": "MDA"
    },
    {
      "id": 141,
      "nombre": "Madagascar",
      "codigo": "MDG"
    },
    {
      "id": 142,
      "nombre": "Maldives",
      "codigo": "MDV"
    },
    {
      "id": 143,
      "nombre": "Mexico",
      "codigo": "MEX"
    },
    {
      "id": 144,
      "nombre": "Marshall Islands",
      "codigo": "MHL"
    },
    {
      "id": 145,
      "nombre": "North Macedonia",
      "codigo": "MKD"
    },
    {
      "id": 146,
      "nombre": "Mali",
      "codigo": "MLI"
    },
    {
      "id": 147,
      "nombre": "Malta",
      "codigo": "MLT"
    },
    {
      "id": 148,
      "nombre": "Myanmar",
      "codigo": "MMR"
    },
    {
      "id": 149,
      "nombre": "Montenegro",
      "codigo": "MNE"
    },
    {
      "id": 150,
      "nombre": "Mongolia",
      "codigo": "MNG"
    },
    {
      "id": 151,
      "nombre": "Northern Mariana Islands",
      "codigo": "MNP"
    },
    {
      "id": 152,
      "nombre": "Mozambique",
      "codigo": "MOZ"
    },
    {
      "id": 153,
      "nombre": "Mauritania",
      "codigo": "MRT"
    },
    {
      "id": 154,
      "nombre": "Montserrat",
      "codigo": "MSR"
    },
    {
      "id": 155,
      "nombre": "Martinique",
      "codigo": "MTQ"
    },
    {
      "id": 156,
      "nombre": "Mauritius",
      "codigo": "MUS"
    },
    {
      "id": 157,
      "nombre": "Malawi",
      "codigo": "MWI"
    },
    {
      "id": 158,
      "nombre": "Malaysia",
      "codigo": "MYS"
    },
    {
      "id": 159,
      "nombre": "Mayotte",
      "codigo": "MYT"
    },
    {
      "id": 160,
      "nombre": "Namibia",
      "codigo": "NAM"
    },
    {
      "id": 161,
      "nombre": "New Caledonia",
      "codigo": "NCL"
    },
    {
      "id": 162,
      "nombre": "Niger",
      "codigo": "NER"
    },
    {
      "id": 163,
      "nombre": "Norfolk Island",
      "codigo": "NFK"
    },
    {
      "id": 164,
      "nombre": "Nigeria",
      "codigo": "NGA"
    },
    {
      "id": 165,
      "nombre": "Nicaragua",
      "codigo": "NIC"
    },
    {
      "id": 166,
      "nombre": "Niue",
      "codigo": "NIU"
    },
    {
      "id": 167,
      "nombre": "Netherlands",
      "codigo": "NLD"
    },
    {
      "id": 168,
      "nombre": "Norway",
      "codigo": "NOR"
    },
    {
      "id": 169,
      "nombre": "Nepal",
      "codigo": "NPL"
    },
    {
      "id": 170,
      "nombre": "Nauru",
      "codigo": "NRU"
    },
    {
      "id": 171,
      "nombre": "New Zealand",
      "codigo": "NZL"
    },
    {
      "id": 172,
      "nombre": "Oman",
      "codigo": "OMN"
    },
    {
      "id": 173,
      "nombre": "Pakistan",
      "codigo": "PAK"
    },
    {
      "id": 174,
      "nombre": "Panama",
      "codigo": "PAN"
    },
    {
      "id": 175,
      "nombre": "Pitcairn",
      "codigo": "PCN"
    },
    {
      "id": 176,
      "nombre": "Peru",
      "codigo": "PER"
    },
    {
      "id": 177,
      "nombre": "Philippines",
      "codigo": "PHL"
    },
    {
      "id": 178,
      "nombre": "Palau",
      "codigo": "PLW"
    },
    {
      "id": 179,
      "nombre": "Papua New Guinea",
      "codigo": "PNG"
    },
    {
      "id": 180,
      "nombre": "Poland",
      "codigo": "POL"
    },
    {
      "id": 181,
      "nombre": "Puerto Rico",
      "codigo": "PRI"
    },
    {
      "id": 182,
      "nombre": "Korea, Democratic People's Republic of",
      "codigo": "PRK"
    },
    {
      "id": 183,
      "nombre": "Portugal",
      "codigo": "PRT"
    },
    {
      "id": 184,
      "nombre": "Paraguay",
      "codigo": "PRY"
    },
    {
      "id": 185,
      "nombre": "Palestine, State of",
      "codigo": "PSE"
    },
    {
      "id": 186,
      "nombre": "French Polynesia",
      "codigo": "PYF"
    },
    {
      "id": 187,
      "nombre": "Qatar",
      "codigo": "QAT"
    },
    {
      "id": 188,
      "nombre": "Réunion",
      "codigo": "REU"
    },
    {
      "id": 189,
      "nombre": "Romania",
      "codigo": "ROU"
    },
    {
      "id": 190,
      "nombre": "Russian Federation",
      "codigo": "RUS"
    },
    {
      "id": 191,
      "nombre": "Rwanda",
      "codigo": "RWA"
    },
    {
      "id": 192,
      "nombre": "Saudi Arabia",
      "codigo": "SAU"
    },
    {
      "id": 193,
      "nombre": "Sudan",
      "codigo": "SDN"
    },
    {
      "id": 194,
      "nombre": "Senegal",
      "codigo": "SEN"
    },
    {
      "id": 195,
      "nombre": "Singapore",
      "codigo": "SGP"
    },
    {
      "id": 196,
      "nombre": "South Georgia and the South Sandwich Islands",
      "codigo": "SGS"
    },
    {
      "id": 197,
      "nombre": "Saint Helena, Ascension and Tristan da Cunha",
      "codigo": "SHN"
    },
    {
      "id": 198,
      "nombre": "Svalbard and Jan Mayen",
      "codigo": "SJM"
    },
    {
      "id": 199,
      "nombre": "Solomon Islands",
      "codigo": "SLB"
    },
    {
      "id": 200,
      "nombre": "Sierra Leone",
      "codigo": "SLE"
    },
    {
      "id": 201,
      "nombre": "El Salvador",
      "codigo": "SLV"
    },
    {
      "id": 202,
      "nombre": "San Marino",
      "codigo": "SMR"
    },
    {
      "id": 203,
      "nombre": "Somalia",
      "codigo": "SOM"
    },
    {
      "id": 204,
      "nombre": "Saint Pierre and Miquelon",
      "codigo": "SPM"
    },
    {
      "id": 205,
      "nombre": "Serbia",
      "codigo": "SRB"
    },
    {
      "id": 206,
      "nombre": "South Sudan",
      "codigo": "SSD"
    },
    {
      "id": 207,
      "nombre": "Sao Tome and Principe",
      "codigo": "STP"
    },
    {
      "id": 208,
      "nombre": "Suriname",
      "codigo": "SUR"
    },
    {
      "id": 209,
      "nombre": "Slovakia",
      "codigo": "SVK"
    },
    {
      "id": 210,
      "nombre": "Slovenia",
      "codigo": "SVN"
    },
    {
      "id": 211,
      "nombre": "Sweden",
      "codigo": "SWE"
    },
    {
      "id": 212,
      "nombre": "Eswatini",
      "codigo": "SWZ"
    },
    {
      "id": 213,
      "nombre": "Sint Maarten (Dutch part)",
      "codigo": "SXM"
    },
    {
      "id": 214,
      "nombre": "Seychelles",
      "codigo": "SYC"
    },
    {
      "id": 215,
      "nombre": "Syrian Arab Republic",
      "codigo": "SYR"
    },
    {
      "id": 216,
      "nombre": "Turks and Caicos Islands",
      "codigo": "TCA"
    },
    {
      "id": 217,
      "nombre": "Chad",
      "codigo": "TCD"
    },
    {
      "id": 218,
      "nombre": "Togo",
      "codigo": "TGO"
    },
    {
      "id": 219,
      "nombre": "Thailand",
      "codigo": "THA"
    },
    {
      "id": 220,
      "nombre": "Tajikistan",
      "codigo": "TJK"
    },
    {
      "id": 221,
      "nombre": "Tokelau",
      "codigo": "TKL"
    },
    {
      "id": 222,
      "nombre": "Turkmenistan",
      "codigo": "TKM"
    },
    {
      "id": 223,
      "nombre": "Timor-Leste",
      "codigo": "TLS"
    },
    {
      "id": 224,
      "nombre": "Tonga",
      "codigo": "TON"
    },
    {
      "id": 225,
      "nombre": "Trinidad and Tobago",
      "codigo": "TTO"
    },
    {
      "id": 226,
      "nombre": "Tunisia",
      "codigo": "TUN"
    },
    {
      "id": 227,
      "nombre": "Turkey",
      "codigo": "TUR"
    },
    {
      "id": 228,
      "nombre": "Tuvalu",
      "codigo": "TUV"
    },
    {
      "id": 229,
      "nombre": "Taiwan, Province of China",
      "codigo": "TWN"
    },
    {
      "id": 230,
      "nombre": "Tanzania, United Republic of",
      "codigo": "TZA"
    },
    {
      "id": 231,
      "nombre": "Uganda",
      "codigo": "UGA"
    },
    {
      "id": 232,
      "nombre": "Ukraine",
      "codigo": "UKR"
    },
    {
      "id": 233,
      "nombre": "United States Minor Outlying Islands",
      "codigo": "UMI"
    },
    {
      "id": 234,
      "nombre": "Uruguay",
      "codigo": "URY"
    },
    {
      "id": 235,
      "nombre": "United States",
      "codigo": "USA"
    },
    {
      "id": 236,
      "nombre": "Uzbekistan",
      "codigo": "UZB"
    },
    {
      "id": 237,
      "nombre": "Holy See (Vatican City State)",
      "codigo": "VAT"
    },
    {
      "id": 238,
      "nombre": "Saint Vincent and the Grenadines",
      "codigo": "VCT"
    },
    {
      "id": 239,
      "nombre": "Venezuela, Bolivarian Republic of",
      "codigo": "VEN"
    },
    {
      "id": 240,
      "nombre": "Virgin Islands, British",
      "codigo": "VGB"
    },
    {
      "id": 241,
      "nombre": "Virgin Islands, U.S.",
      "codigo": "VIR"
    },
    {
      "id": 242,
      "nombre": "Viet Nam",
      "codigo": "VNM"
    },
    {
      "id": 243,
      "nombre": "Vanuatu",
      "codigo": "VUT"
    },
    {
      "id": 244,
      "nombre": "Wallis and Futuna",
      "codigo": "WLF"
    },
    {
      "id": 245,
      "nombre": "Samoa",
      "codigo": "WSM"
    },
    {
      "id": 246,
      "nombre": "Yemen",
      "codigo": "YEM"
    },
    {
      "id": 247,
      "nombre": "South Africa",
      "codigo": "ZAF"
    },
    {
      "id": 248,
      "nombre": "Zambia",
      "codigo": "ZMB"
    },
    {
      "id": 249,
      "nombre": "Zimbabwe",
      "codigo": "ZWE"
    }]
  }



}
