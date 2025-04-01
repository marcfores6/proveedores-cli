import { IProductoImagen } from "./productoImagen.interface";
import { ITipoProveedor } from "./tipoproveedor.interface";

export interface IProveedor {  
    id:number,
    empresa:string,
    email:string,
    password:string,
    imagenes: IProductoImagen[],
    imagenUrl:string | null,
    tipoproveedor: ITipoProveedor

}