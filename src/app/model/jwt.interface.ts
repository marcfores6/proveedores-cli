export interface IJwt {
    jti: string,
    id: string,
    nif: string,
    proveedorId: string,
    rol: string,
    sub: string,
    iss: string,
    iat: number,
    exp: number
}