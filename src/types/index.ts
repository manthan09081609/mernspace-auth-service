import { Request } from "express";

export interface SearchParameters {
  id?: string;
}

export interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: string;
  tenantId?: number;
}

export interface RegisterUserRequest extends Request {
  body: UserData;
}

export interface UserLoginData {
  email: string;
  password: string;
}

export interface LoginUserRequest extends Request {
  body: UserLoginData;
}

export interface CreateUserRequest {
  body: UserData;
}

export interface UpdateUserData {
  firstName: string;
  lastName: string;
  email: string;
  role?: string;
  tenantId?: number;
}

export interface UpdateUserRequest {
  body: UpdateUserData;
  params: SearchParameters;
}

export interface TenantData {
  name: string;
  address: string;
}

export interface CreateTenantRequest {
  body: TenantData;
}

export interface UpdateTenantRequest {
  body: TenantData;
  params: SearchParameters;
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
