import { NextFunction, Request, Response } from "express";
import { AuthRequest, CreateUserRequest } from "../types";
import createHttpError from "http-errors";
import { Roles } from "../constants";

export const canCreate = (roles: Array<string>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const _req = req as AuthRequest;
    const role = _req.auth.role;
    const userRole = (req as CreateUserRequest).body.role!;

    if (!roles.includes(role)) {
      const error = createHttpError(403, "access denied");
      return next(error);
    }

    if (userRole === Roles.CUSTOMER || userRole === Roles.ADMIN) {
      const error = createHttpError(
        403,
        `access denied, can't create user with role:${userRole}`,
      );
      return next(error);
    }

    if (userRole !== Roles.MANAGER) {
      const error = createHttpError(403, `invalid role`);
      return next(error);
    }

    return next();
  };
};
