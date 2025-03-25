export interface IJwt {
    jti: string,
    id: string,
    email: string,
    sub: string,
    iss: string,
    iat: number,
    exp: number
}