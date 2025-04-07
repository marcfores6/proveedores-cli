export interface IProveedor {
  id: number;
  descripcion: string;
  nif : string;
  id_comprador: number;
  id_gestor: number;
  password: string;
}