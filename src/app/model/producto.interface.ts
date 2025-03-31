import { ITipoProducto } from "./tipoproducto.interface";

export interface IProducto {
    codigo:number,
    nombre:string,
    tipoproducto: ITipoProducto,
    imagenUrl:string | null,
}