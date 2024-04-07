import { Logger } from "winston";
import { validationResult } from "express-validator";
import { NextFunction, Request, Response } from "express";

import { CreateTenantRequest } from "../types";
import { TenantService } from "../services/TenantService";

export class TenantController {
  constructor(
    private tenanService: TenantService,
    private logger: Logger,
  ) {}

  async create(req: CreateTenantRequest, res: Response, next: NextFunction) {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() });
    }

    const { name, address } = req.body;

    this.logger.debug("new request to create a tenant", {
      name,
      address,
    });

    try {
      const tenant = await this.tenanService.create({
        name,
        address,
      });

      res.status(201).json({ id: tenant.id });
    } catch (err) {
      next(err);
      return;
    }
  }

  async getTenants(req: Request, res: Response, next: NextFunction) {
    this.logger.debug("new request to get tenants list");

    try {
      const tenants = await this.tenanService.getTenants();

      res.status(200).json({ tenants });
    } catch (err) {
      next(err);
      return;
    }
  }
}
