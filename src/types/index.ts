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
