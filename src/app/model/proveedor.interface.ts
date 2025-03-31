import { ITipoProveedor } from "./tipoproveedor.interface";

export interface IProveedor {  
    id:number,
    empresa:string,
    email:string,
    password:string,
    imagen:string | null,
    imagenUrl:string | null,
    tipoproveedor: ITipoProveedor

}