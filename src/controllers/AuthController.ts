import { Logger } from "winston";
import { validationResult } from "express-validator";
import { NextFunction, Response } from "express";
import { JwtPayload } from "jsonwebtoken";

import {
  AuthRequest,
  GeneratePasswordRequest,
  LoginUserRequest,
  RegisterUserRequest,
  UpdateUserAuthRequest,
  UpdateUserPasswordRequest,
} from "../types";
import { UserService } from "../services/UserService";

import { TokenService } from "../services/TokenService";
import createHttpError from "http-errors";
import { CredentialService } from "../services/CredentialService";
import { Roles } from "../constants";

export class AuthController {
  constructor(
    private userService: UserService,
    private tokenService: TokenService,
    private credentialService: CredentialService,
    private logger: Logger,
  ) {}

  async register(req: RegisterUserRequest, res: Response, next: NextFunction) {
    const result = validationResult(req);

    if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() });
    }

    const { firstName, lastName, email, password } = req.body;

    this.logger.info("new request to register a user", {
      firstName,
      lastName,
      email,
      password: "*******",
    });

    try {
      const user = await this.userService.create({
        firstName,
        lastName,
        email,
        password,
        role: Roles.CUSTOMER,
      });
      this.logger.info("user has been registered", { id: user.id });

      const payload: JwtPayload = {
        sub: String(user.id),
        role: user.role,
      };

      const accessToken = this.tokenService.generateAccessToken(payload);
      const refreshToken = await this.tokenService.generateRefreshToken(
        payload,
        user,
      );

      res.cookie("accessToken", accessToken, {
        domain: "localhost",
        sameSite: "strict",
        maxAge: 1000 * 60 * 60,
        httpOnly: true,
      });

      res.cookie("refreshToken", refreshToken, {
        domain: "localhost",
        sameSite: "strict",
        maxAge: 1000 * 60 * 60 * 24 * 365,
        httpOnly: true,
      });

      res.status(201).json({ id: user.id });
    } catch (err) {
      next(err);
      return;
    }
  }

  async login(req: LoginUserRequest, res: Response, next: NextFunction) {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() });
    }

    const { email, password } = req.body;

    this.logger.info("request to login a user", {
      email,
      password: "*******",
    });

    try {
      const user = await this.userService.findByEmailWithPassword(email);

      if (!user) {
        const err = createHttpError(400, "email or password does not match");
        return next(err);
      }

      const passwordMatch = await this.credentialService.comparePassword(
        password,
        user.password,
      );

      if (!passwordMatch) {
        const err = createHttpError(400, "email or password does not match");
        return next(err);
      }

      const payload: JwtPayload = {
        sub: String(user.id),
        role: user.role,
      };

      const accessToken = this.tokenService.generateAccessToken(payload);
      const refreshToken = await this.tokenService.generateRefreshToken(
        payload,
        user,
      );

      res.cookie("accessToken", accessToken, {
        domain: "localhost",
        sameSite: "strict",
        maxAge: 1000 * 60 * 60,
        httpOnly: true,
      });

      res.cookie("refreshToken", refreshToken, {
        domain: "localhost",
        sameSite: "strict",
        maxAge: 1000 * 60 * 60 * 24 * 365,
        httpOnly: true,
      });

      this.logger.info("user has been logged in", { id: user.id });

      res.status(200).json({ id: user.id });
    } catch (err) {
      next(err);
      return;
    }
  }

  async self(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await this.userService.findById(Number(req.auth.sub));

      if (!user) {
        const error = createHttpError(400, "user not found");
        return next(error);
      }

      return res.json({ ...user, password: undefined });
    } catch (err) {
      return next(err);
    }
  }

  async refresh(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const payload: JwtPayload = {
        sub: req.auth.sub,
        role: req.auth.role,
      };

      const user = await this.userService.findById(Number(req.auth.sub));

      if (!user) {
        const error = createHttpError(400, "user not registered");
        return next(error);
      }

      await this.tokenService.revokeRefreshToken(Number(req.auth.id));

      const accessToken = this.tokenService.generateAccessToken(payload);
      const refreshToken = await this.tokenService.generateRefreshToken(
        payload,
        user,
      );

      res.cookie("accessToken", accessToken, {
        domain: "localhost",
        sameSite: "strict",
        maxAge: 1000 * 60 * 60,
        httpOnly: true,
      });

      res.cookie("refreshToken", refreshToken, {
        domain: "localhost",
        sameSite: "strict",
        maxAge: 1000 * 60 * 60 * 24 * 365,
        httpOnly: true,
      });

      this.logger.info("token has been refreshed", { id: user.id });

      res.status(200).json({ id: user.id });
    } catch (err) {
      return next(err);
    }
  }

  async logout(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await this.tokenService.revokeRefreshToken(Number(req.auth.id));

      this.logger.info("user has been logged out", { id: req.auth.sub });

      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");

      return res.status(200).json({});
    } catch (err) {
      return next(err);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      // await this.tokenService.deleteRefreshTokens(Number(req.auth.sub));
      await this.userService.deleteById(Number(req.auth.sub));

      this.logger.info("user account has been deleted", { id: req.auth.sub });

      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");

      return res.status(200).json({});
    } catch (err) {
      return next(err);
    }
  }

  async update(req: UpdateUserAuthRequest, res: Response, next: NextFunction) {
    try {
      const result = validationResult(req);
      if (!result.isEmpty()) {
        return res.status(400).json({ errors: result.array() });
      }

      const { email, firstName, lastName } = req.body;
      await this.userService.update(req.auth.sub, {
        email: email,
        firstName: firstName,
        lastName: lastName,
      });
      this.logger.info("user account has been updated", { id: req.auth.sub });

      return res.status(200).json({ id: req.auth.sub });
    } catch (err) {
      return next(err);
    }
  }

  async updatePassword(
    req: UpdateUserPasswordRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const result = validationResult(req);
      if (!result.isEmpty()) {
        return res.status(400).json({ errors: result.array() });
      }

      const { oldPassword, newPassword } = req.body;

      if (oldPassword === newPassword) {
        const err = createHttpError(
          400,
          "new password & old password can be same",
        );
        return next(err);
      }

      const user = await this.userService.findByIdWithPassword(
        Number(req.auth.sub),
      );

      if (!user) {
        const err = createHttpError(400, "user not registered");
        return next(err);
      }

      const passwordMatch = await this.credentialService.comparePassword(
        oldPassword,
        user.password,
      );

      if (!passwordMatch) {
        const err = createHttpError(400, "wrong old password");
        return next(err);
      }

      await this.userService.updatePassword(req.auth.sub, newPassword);

      this.logger.info("user password has been updated", { id: user.id });

      res.status(200).json({ id: user.id });
    } catch (err) {
      next(err);
      return;
    }
  }

  async forgotPassword(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = this.userService.findById(Number(req.auth.sub));

      if (!user) {
        const err = createHttpError(400, "user not registered");
        return next(err);
      }

      // front end redirect url
      res.redirect(302, "/auth/generate-new-password");
    } catch (error) {
      return next(error);
    }
  }

  async generateNewPassword(
    req: GeneratePasswordRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const result = validationResult(req);
      if (!result.isEmpty()) {
        return res.status(400).json({ errors: result.array() });
      }

      const { password } = req.body;

      await this.userService.updatePassword(req.auth.sub, password);

      this.logger.info("user password has been updated", { id: req.auth.sub });

      res.status(200).json({ id: req.auth.sub });
    } catch (err) {
      next(err);
      return;
    }
  }
}
