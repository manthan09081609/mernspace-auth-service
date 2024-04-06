import { Logger } from "winston";
import { validationResult } from "express-validator";
import { NextFunction, Response } from "express";
import { JwtPayload } from "jsonwebtoken";

import { AuthRequest, LoginUserRequest, RegisterUserRequest } from "../types";
import { UserService } from "../services/UserService";

import { TokenService } from "../services/TokenService";
import createHttpError from "http-errors";
import { CredentialService } from "../services/CredentialService";

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

    this.logger.debug("new request to register a user", {
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

    this.logger.debug("request to login a user", {
      email,
      password: "*******",
    });

    try {
      const user = await this.userService.findByEmail(email);

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
}
