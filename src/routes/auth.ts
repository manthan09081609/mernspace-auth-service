import express, { NextFunction, Request, Response } from "express";

import logger from "../config/logger";
import { AppDataSource } from "../config/data-source";

import { AuthController } from "../controllers/AuthController";

import { User } from "../entity/User";
import { RefreshToken } from "../entity/RefreshToken";

import loginValidator from "../validators/login-validator";
import registerValidator from "../validators/register-validator";

import { UserService } from "../services/UserService";
import { TokenService } from "../services/TokenService";
import { CredentialService } from "../services/CredentialService";

import authenticate from "../middlewares/authenticate";
import {
  AuthRequest,
  GeneratePasswordRequest,
  UpdateUserAuthRequest,
  UpdateUserPasswordRequest,
} from "../types";
import validateRefreshToken from "../middlewares/validateRefreshToken";
import parseRefreshToken from "../middlewares/parseRefreshToken";
import userDataValidator from "../validators/user-data-validator";
import passwordValidator from "../validators/password-validator";
import { canAccess } from "../middlewares/canAccess";
import { Roles } from "../constants";

const router = express.Router();

const userRepository = AppDataSource.getRepository(User);
const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);

const userService = new UserService(userRepository);
const tokenService = new TokenService(refreshTokenRepository);
const credentialService = new CredentialService();

const authController = new AuthController(
  userService,
  tokenService,
  credentialService,
  logger,
);

router.post(
  "/register",
  registerValidator,
  (req: Request, res: Response, next: NextFunction) =>
    authController.register(req, res, next),
);

router.post(
  "/login",
  loginValidator,
  (req: Request, res: Response, next: NextFunction) =>
    authController.login(req, res, next),
);

router.get(
  "/self",
  authenticate,
  (req: Request, res: Response, next: NextFunction) =>
    authController.self(req as AuthRequest, res, next),
);

router.post(
  "/refresh",
  validateRefreshToken,
  (req: Request, res: Response, next: NextFunction) =>
    authController.refresh(req as AuthRequest, res, next),
);

router.post(
  "/logout",
  [authenticate, parseRefreshToken],
  (req: Request, res: Response, next: NextFunction) =>
    authController.logout(req as AuthRequest, res, next),
);

router.delete(
  "/delete",
  authenticate,
  canAccess([Roles.CUSTOMER, Roles.MANAGER]),
  (req: Request, res: Response, next: NextFunction) =>
    authController.delete(req as AuthRequest, res, next),
);

router.patch(
  "/update",
  authenticate,
  userDataValidator,
  (req: Request, res: Response, next: NextFunction) =>
    authController.update(req as unknown as UpdateUserAuthRequest, res, next),
);

router.patch(
  "/update-password",
  authenticate,
  passwordValidator,
  (req: Request, res: Response, next: NextFunction) =>
    authController.updatePassword(
      req as unknown as UpdateUserPasswordRequest,
      res,
      next,
    ),
);

router.get(
  "/forgot-password",
  authenticate,
  (req: Request, res: Response, next: NextFunction) =>
    authController.forgotPassword(req as AuthRequest, res, next),
);

router.get(
  "/generate-new-password",
  authenticate,
  passwordValidator,
  (req: Request, res: Response, next: NextFunction) =>
    authController.generateNewPassword(
      req as unknown as GeneratePasswordRequest,
      res,
      next,
    ),
);

export default router;
