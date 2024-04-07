import express, { NextFunction, Request, Response } from "express";

import logger from "../config/logger";
import { AppDataSource } from "../config/data-source";

import authenticate from "../middlewares/authenticate";
import { Roles } from "../constants";
import { AuthRequest } from "../types";
import { User } from "../entity/User";
import { UserService } from "../services/UserService";
import { UserController } from "../controllers/UserController";

import { canCreate } from "../middlewares/canCreate";
import { TenantService } from "../services/TenantService";
import { Tenant } from "../entity/Tenant";
import idValidator from "../validators/id-validator";
import { canAccess } from "../middlewares/canAccess";
import userDataValidator from "../validators/user-data-validator";
import { canUpdate } from "../middlewares/canUpdate";

const userRepository = AppDataSource.getRepository(User);
const tenantRepository = AppDataSource.getRepository(Tenant);

const userService = new UserService(userRepository);
const tenantService = new TenantService(tenantRepository);

const userController = new UserController(userService, tenantService, logger);

const router = express.Router();

router.post(
  "/create",
  authenticate,
  canCreate([Roles.ADMIN]),
  userDataValidator,
  (req: Request, res: Response, next: NextFunction) =>
    userController.create(req as AuthRequest, res, next),
);

router.get("/", (req: Request, res: Response, next: NextFunction) =>
  userController.getUsers(req, res, next),
);

router.get(
  "/:id",
  authenticate,
  canAccess([Roles.ADMIN]),
  idValidator,
  (req: Request, res: Response, next: NextFunction) =>
    userController.getUser(req, res, next),
);

router.patch(
  "/update/:id",

  authenticate,
  canUpdate([Roles.ADMIN, Roles.MANAGER]),
  idValidator,
  userDataValidator,
  (req: Request, res: Response, next: NextFunction) =>
    userController.update(req, res, next),
);

router.delete(
  "/delete/:id",
  authenticate,
  canAccess([Roles.ADMIN]),
  idValidator,
  (req: Request, res: Response, next: NextFunction) =>
    userController.delete(req, res, next),
);

export default router;
