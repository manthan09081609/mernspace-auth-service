import { Logger } from "winston";
import { validationResult } from "express-validator";
import { NextFunction, Request, Response } from "express";

import { CreateUserRequest, UpdateUserRequest } from "../types";
import { UserService } from "../services/UserService";
import { TenantService } from "../services/TenantService";
import createHttpError from "http-errors";
import { Roles } from "../constants";

export class UserController {
  constructor(
    private userService: UserService,
    private tenantService: TenantService,
    private logger: Logger,
  ) {}

  async create(req: CreateUserRequest, res: Response, next: NextFunction) {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() });
    }

    const { email, firstName, lastName, password, role, tenantId } = req.body;

    this.logger.info("new request to create a user", {
      email,
      password: "******",
      firstName,
      lastName,
      role,
    });

    try {
      if (tenantId !== undefined) {
        const tenant = await this.tenantService.getTenant(Number(tenantId));
        if (!tenant) {
          const error = createHttpError(400, "tenant not present");
          throw error;
        }
      }

      const user = await this.userService.create({
        firstName,
        lastName,
        email,
        password,
        role,
        tenantId: tenantId,
      });

      res.status(201).json({ id: user.id });
    } catch (err) {
      next(err);
      return;
    }
  }

  async getUsers(req: Request, res: Response, next: NextFunction) {
    this.logger.info("new request to get users list");

    try {
      const users = await this.userService.getUsers();
      this.logger.info("all users have been fetched");

      res.status(200).json(users);
    } catch (err) {
      next(err);
      return;
    }
  }

  async getUser(req: Request, res: Response, next: NextFunction) {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() });
    }
    const id = req.params.id;

    this.logger.info("new request to get a user", { id: id });

    try {
      const user = await this.userService.getUser(Number(id));

      if (!user) {
        const error = createHttpError(400, "user is not present");
        return next(error);
      }

      res.status(200).json(user);
    } catch (err) {
      next(err);
      return;
    }
  }

  async update(req: UpdateUserRequest, res: Response, next: NextFunction) {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() });
    }

    const userId = req.params.id;

    try {
      const user = await this.userService.getUser(Number(userId));

      if (!user) {
        const error = createHttpError(400, "user is not present");
        return next(error);
      }
    } catch (error) {
      return next(error);
    }

    const { email, firstName, lastName, role, tenantId } = req.body;

    this.logger.info("new request to update a user", {
      email,
      firstName,
      lastName,
      role,
    });

    try {
      if (tenantId !== undefined) {
        const tenant = await this.tenantService.getTenant(Number(tenantId));
        if (!tenant) {
          const error = createHttpError(400, "tenant not present");
          throw error;
        }
      }

      await this.userService.update(userId!, {
        email,
        firstName,
        lastName,
        role,
        tenantId,
      });

      res.status(200).json({ id: userId });
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

    const userId = req.params.id;

    try {
      const user = await this.userService.getUser(Number(userId));

      if (!user) {
        const error = createHttpError(400, "user is not present");
        return next(error);
      }

      if (user.role === Roles.ADMIN) {
        const error = createHttpError(400, "access denied");
        return next(error);
      }
    } catch (error) {
      return next(error);
    }

    this.logger.info("new request to delete a user");

    try {
      await this.userService.delete(userId);
      res.status(200).json({ id: userId });
    } catch (err) {
      next(err);
      return;
    }
  }
}
