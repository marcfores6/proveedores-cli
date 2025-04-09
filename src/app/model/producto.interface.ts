import { Timestamp } from "rxjs";
import { IProductoImagen } from "./productoImagen.interface";
import { IProductoDocumento } from "./productoDocumento.interface";

export interface IProducto {
  id: number;

  descripcion?: string;
  descripcionTic?: string;
  departamento?: number;
  familia?: number;
  subfamilia?: number;
  marca?: string;
  unidadDeMedida?: string;
  cantidad?: number;
  centralizado?: string;
  apeso?: number;
  unidadDeCaja?: number;
  unidadDeServicio?: number;
  pk?: number;
  cajasCapa?: number;
  cajasPalet?: number;
  proveedor?: string;
  referenciaProveedor?: string;

  ean?: string;
  ean_c?: string;
  ean_p?: string;

  largo?: number;
  ancho?: number;
  alto?: number;
  peso?: number;

  diasCaducidad?: number;
  ara_cen?: string;
  iva?: string;

  precioVenta?: number;
  pvp_hom?: number;
  pvp_and?: number;
  pvp_cat?: number;
  precioTarifa?: number;
  pro_fac?: string;
  precioNeto?: number;
  pro_ffac?: string;
  pro_neton?: number;

  art_mkd?: string;
  articuloSustituido?: string;

  insertedBy?: string;
  insertedAt?: Timestamp<Date>;  // ISO string (Timestamp)
  updateBy?: string;
  updateAt?: Timestamp<Date>;

  status?: number;
  observaciones?: string;

  imagen?: string;
  partidaArancelaria?: string;
  pvp_mel?: number;
  paisOrigen?: string;

  imagenes?: IProductoImagen[]; // por si usás imágenes relacionadas

  documentos?: IProductoDocumento[];

}
