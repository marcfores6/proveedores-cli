import { ITipoProducto } from "./tipoproducto.interface";

export interface IProducto {
    codigo:number,
    nombre:string,
    imagen:string | null,
    tipoproducto: ITipoProducto
}