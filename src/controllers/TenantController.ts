import { Logger } from "winston";
import { validationResult } from "express-validator";
import { NextFunction, Request, Response } from "express";

import { CreateTenantRequest, UpdateTenantRequest } from "../types";
import { TenantService } from "../services/TenantService";
import createHttpError from "http-errors";

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

    this.logger.info("new request to create a tenant", {
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
    this.logger.info("new request to get tenants list");

    try {
      const tenants = await this.tenanService.getTenants();
      this.logger.info("all tenant have been fetched");

      res.status(200).json(tenants);
    } catch (err) {
      next(err);
      return;
    }
  }

  async getTenantById(req: Request, res: Response, next: NextFunction) {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() });
    }
    const id = req.params.id;

    this.logger.info("new request to get a tenant", { id: id });

    try {
      const tenant = await this.tenanService.getTenant(Number(id));

      if (!tenant) {
        const error = createHttpError(400, "tenant is not present");
        return next(error);
      }

      res.status(200).json(tenant);
    } catch (err) {
      next(err);
      return;
    }
  }

  async update(req: UpdateTenantRequest, res: Response, next: NextFunction) {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() });
    }

    const tenantId = req.params.id;

    try {
      const tenant = await this.tenanService.getTenant(Number(tenantId));

      if (!tenant) {
        const error = createHttpError(400, "tenant is not present");
        return next(error);
      }
    } catch (error) {
      return next(error);
    }

    const { name, address } = req.body;

    this.logger.info("new request to update a tenant", {
      name,
      address,
    });

    try {
      await this.tenanService.update(tenantId!, {
        name,
        address,
      });

      res.status(200).json({ id: tenantId });
    } catch (err) {
      next(err);
      return;
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() });
    }

    const tenantId = req.params.id;

    try {
      const tenant = await this.tenanService.getTenant(Number(tenantId));

      if (!tenant) {
        const error = createHttpError(400, "tenant is not present");
        return next(error);
      }
    } catch (error) {
      return next(error);
    }

    this.logger.info("new request to delete a tenant");

    try {
      await this.tenanService.delete(tenantId);
      res.status(200).json({ id: tenantId });
    } catch (err) {
      next(err);
      return;
    }
  }
}
