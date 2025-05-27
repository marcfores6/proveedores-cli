import { Timestamp } from "rxjs";
import { IProductoImagen } from "./productoImagen.interface";
import { IProductoDocumento } from "./productoDocumento.interface";

export interface IProducto {
  id: number;
  descripcion?: string;

  marca?: string;
  //unidadDeMedida?: string;
  //centralizado?: string;
  apeso?: number;
  unidadDeCaja?: number;
  //unidadDeServicio?: number;
  unidadDePack?: number;
  cajasCapa?: number;
  cajasPalet?: number;
  proveedor?: string;
  referenciaProveedor?: string;

  ean?: string;
  ean_caja?: string;
  ean_pack?: string;

  largo_caja?: number;
  ancho_caja?: number;
  alto_caja?: number;
  peso_caja?: number;

  largo_unidad?: number;
  ancho_unidad?: number;
  alto_unidad?: number;
  peso_neto_unidad?: number;
  peso_escurrido_unidad?: number;

  diasCaducidad?: number;
  iva?: string;

  observaciones?: string;

  imagen?: string;
  partidaArancelaria?: string;
  paisOrigen?: string;

  imagenes?: IProductoImagen[]; // por si usas imágenes relacionadas

  documentos?: IProductoDocumento[];

  estado?: string; 
  showEnviarButton?: boolean;

  leadtime?: number; 
  moq?:number; 
  multiploDePedido?: string;

}
