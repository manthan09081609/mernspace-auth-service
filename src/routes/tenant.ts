import express, { NextFunction, Request, Response } from "express";

import logger from "../config/logger";
import { AppDataSource } from "../config/data-source";
import createTenantValidator from "../validators/create-tenant-validator";
import { TenantController } from "../controllers/TenantController";
import { TenantService } from "../services/TenantService";
import { Tenant } from "../entity/Tenant";
import authenticate from "../middlewares/authenticate";
import { canAccess } from "../middlewares/canAccess";
import { Roles } from "../constants";
import { AuthRequest } from "../types";

const tenantRepository = AppDataSource.getRepository(Tenant);

const tenantService = new TenantService(tenantRepository);

const tenantController = new TenantController(tenantService, logger);

const router = express.Router();

router.post(
  "/",
  createTenantValidator,
  authenticate,
  canAccess([Roles.ADMIN]),
  (req: Request, res: Response, next: NextFunction) =>
    tenantController.create(req as AuthRequest, res, next),
);

export default router;
