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
import { AuthRequest } from "../types";
import validateRefreshToken from "../middlewares/validateRefreshToken";

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

export default router;
