import express, { NextFunction, Request, Response } from "express";

import logger from "../config/logger";
import { AppDataSource } from "../config/data-source";

import { TenantController } from "../controllers/TenantController";
import { TenantService } from "../services/TenantService";
import { Tenant } from "../entity/Tenant";
import authenticate from "../middlewares/authenticate";
import { canAccess } from "../middlewares/canAccess";
import { Roles } from "../constants";
import { AuthRequest } from "../types";
import idValidator from "../validators/id-validator";
import tenantDataValidator from "../validators/tenant-data-validator";

const tenantRepository = AppDataSource.getRepository(Tenant);

const tenantService = new TenantService(tenantRepository);

const tenantController = new TenantController(tenantService, logger);

const router = express.Router();

router.post(
  "/create",
  tenantDataValidator,
  authenticate,
  canAccess([Roles.ADMIN]),
  (req: Request, res: Response, next: NextFunction) =>
    tenantController.create(req as AuthRequest, res, next),
);

router.get("/", (req: Request, res: Response, next: NextFunction) =>
  tenantController.getTenants(req, res, next),
);

router.get(
  "/:id",
  idValidator,
  (req: Request, res: Response, next: NextFunction) =>
    tenantController.getTenantById(req, res, next),
);

router.patch(
  "/update/:id",
  idValidator,
  tenantDataValidator,
  authenticate,
  canAccess([Roles.ADMIN, Roles.MANAGER]),
  (req: Request, res: Response, next: NextFunction) =>
    tenantController.update(req, res, next),
);

router.delete(
  "/delete/:id",
  idValidator,
  authenticate,
  canAccess([Roles.ADMIN]),
  (req: Request, res: Response, next: NextFunction) =>
    tenantController.delete(req, res, next),
);

export default router;
