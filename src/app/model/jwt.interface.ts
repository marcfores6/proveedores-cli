export interface IJwt {
    jti: string,
    id: string,
    nif: string,
    sub: string,
    iss: string,
    iat: number,
    exp: number
}