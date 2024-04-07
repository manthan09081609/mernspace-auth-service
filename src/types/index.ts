import { Request } from "express";

export interface UserRegisterationData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface RegisterUserRequest extends Request {
  body: UserRegisterationData;
}

export interface UserLoginData {
  email: string;
  password: string;
}

export interface LoginUserRequest extends Request {
  body: UserLoginData;
}

export interface TenantCreateData {
  name: string;
  address: string;
}

export interface CreateTenantRequest {
  body: TenantCreateData;
}

export interface RefreshTokenData {
  id: number;
}

export interface AuthRequest extends Request {
  auth: {
    id?: string;
    sub: string;
    role: string;
  };
}

export interface AuthCookie {
  accessToken: string;
  refreshToken: string;
}

export interface IRefreshTokenPayload {
  id: string;
}
