import { NextFunction, Response, Request } from "express";
import { AuthRequest } from "../types";
import createHttpError from "http-errors";

export const canAccess = (roles: Array<string>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const _req = req as AuthRequest;
    const role = _req.auth.role;

    if (!roles.includes(role)) {
      const error = createHttpError(403, "access denied");
      return next(error);
    }

    return next();
  };
};
