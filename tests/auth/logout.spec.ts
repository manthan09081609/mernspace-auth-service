import request from "supertest";
import { DataSource } from "typeorm";

import app from "../../src/app";
import { User } from "../../src/entity/User";
import { AppDataSource } from "../../src/config/data-source";
import { RefreshToken } from "../../src/entity/RefreshToken";
import createJWKSMock, { JWKSMock } from "mock-jwks";
import { Roles } from "../../src/constants";
import { sign } from "jsonwebtoken";
import { Config } from "../../src/config";

describe("POST /auth/logout", () => {
  let connection: DataSource;
  let jwks: JWKSMock;

  beforeAll(async () => {
    jwks = createJWKSMock("http:localhost:5501");
    connection = await AppDataSource.initialize();
  });

  beforeEach(async () => {
    jwks.start();

    await connection.dropDatabase();
    await connection.synchronize();
  });

  afterEach(() => {
    jwks.stop();
  });

  afterAll(async () => {
    await connection.destroy();
  });

  describe("All fields given", () => {
    it("should return 200 status code", async () => {
      // Arrange
      const userData = {
        firstName: "Manthan",
        lastName: "Sharma",
        email: "manthan@gmail.com",
        password: "password",
        role: Roles.CUSTOMER,
      };

      const userRepository = connection.getRepository(User);
      const refreshTokenRepository = connection.getRepository(RefreshToken);
      const MS_IN_YEAR = 1000 * 60 * 60 * 24 * 365;

      const user = await userRepository.save(userData);
      const refreshTokenData = await refreshTokenRepository.save({
        user: user,
        expiresAt: new Date(Date.now() + MS_IN_YEAR),
      });

      const payload = {
        sub: String(user.id),
        role: user.role,
      };

      const accessToken = jwks.token(payload);

      const refreshToken = sign(
        { ...payload, id: String(refreshTokenData.id) },
        Config.REFRESH_TOKEN_SECRET!,
        {
          algorithm: "HS256",
          expiresIn: "1y",
          issuer: "auth-service",
          jwtid: String(refreshTokenData.id),
        },
      );

      // Act
      const response = await request(app)
        .post("/auth/logout")
        .set("Cookie", [
          `accessToken=${accessToken}`,
          `refreshToken=${refreshToken}`,
        ])
        .send();

      // Assert
      expect(response.statusCode).toBe(200);
    });

    it("should return valid json response", async () => {
      // Arrange
      const userData = {
        firstName: "Manthan",
        lastName: "Sharma",
        email: "manthan@gmail.com",
        password: "password",
        role: Roles.CUSTOMER,
      };

      const userRepository = connection.getRepository(User);
      const refreshTokenRepository = connection.getRepository(RefreshToken);
      const MS_IN_YEAR = 1000 * 60 * 60 * 24 * 365;

      const user = await userRepository.save(userData);
      const refreshTokenData = await refreshTokenRepository.save({
        user: user,
        expiresAt: new Date(Date.now() + MS_IN_YEAR),
      });

      const payload = {
        sub: String(user.id),
        role: user.role,
      };

      const accessToken = jwks.token(payload);

      const refreshToken = sign(
        { ...payload, id: String(refreshTokenData.id) },
        Config.REFRESH_TOKEN_SECRET!,
        {
          algorithm: "HS256",
          expiresIn: "1y",
          issuer: "auth-service",
          jwtid: String(refreshTokenData.id),
        },
      );

      // Act
      const response = await request(app)
        .post("/auth/logout")
        .set("Cookie", [
          `accessToken=${accessToken}`,
          `refreshToken=${refreshToken}`,
        ])
        .send();

      // Assert
      expect(
        (response.headers as Record<string, string>)["content-type"],
      ).toEqual(expect.stringContaining("json"));
    });

    it("should return empty access & refresh token in cookies", async () => {
      // Arrange
      const userData = {
        firstName: "Manthan",
        lastName: "Sharma",
        email: "manthan@gmail.com",
        password: "password",
        role: Roles.CUSTOMER,
      };

      const userRepository = connection.getRepository(User);
      const refreshTokenRepository = connection.getRepository(RefreshToken);
      const MS_IN_YEAR = 1000 * 60 * 60 * 24 * 365;

      const user = await userRepository.save(userData);
      const refreshTokenData = await refreshTokenRepository.save({
        user: user,
        expiresAt: new Date(Date.now() + MS_IN_YEAR),
      });

      const payload = {
        sub: String(user.id),
        role: user.role,
      };

      const accessToken = jwks.token(payload);

      const refreshToken = sign(
        { ...payload, id: String(refreshTokenData.id) },
        Config.REFRESH_TOKEN_SECRET!,
        {
          algorithm: "HS256",
          expiresIn: "1y",
          issuer: "auth-service",
          jwtid: String(refreshTokenData.id),
        },
      );

      // Act
      const response = await request(app)
        .post("/auth/logout")
        .set("Cookie", [
          `accessToken=${accessToken}`,
          `refreshToken=${refreshToken}`,
        ])
        .send();

      let newAccessToken = null;
      let newRefreshToken = null;
      interface Headers {
        ["set-cookie"]: string[];
      }
      const cookies =
        (response.headers as unknown as Headers)["set-cookie"] || [];

      cookies.forEach((cookie) => {
        if (cookie.startsWith("accessToken")) {
          newAccessToken = cookie.split(";")[0].split("=")[1];
        }
        if (cookie.startsWith("refreshToken")) {
          newRefreshToken = cookie.split(";")[0].split("=")[1];
        }
      });

      // Assert
      expect(newAccessToken).toBe("");
      expect(newRefreshToken).toBe("");
    });

    it("should delete refresh token from database", async () => {
      // Arrange
      const userData = {
        firstName: "Manthan",
        lastName: "Sharma",
        email: "manthan@gmail.com",
        password: "password",
        role: Roles.CUSTOMER,
      };

      const userRepository = connection.getRepository(User);
      const refreshTokenRepository = connection.getRepository(RefreshToken);
      const MS_IN_YEAR = 1000 * 60 * 60 * 24 * 365;

      const user = await userRepository.save(userData);
      const refreshTokenData = await refreshTokenRepository.save({
        user: user,
        expiresAt: new Date(Date.now() + MS_IN_YEAR),
      });

      const payload = {
        sub: String(user.id),
        role: user.role,
      };

      const accessToken = jwks.token(payload);

      const refreshToken = sign(
        { ...payload, id: String(refreshTokenData.id) },
        Config.REFRESH_TOKEN_SECRET!,
        {
          algorithm: "HS256",
          expiresIn: "1y",
          issuer: "auth-service",
          jwtid: String(refreshTokenData.id),
        },
      );

      // Act
      await request(app)
        .post("/auth/logout")
        .set("Cookie", [
          `accessToken=${accessToken}`,
          `refreshToken=${refreshToken}`,
        ])
        .send();

      const refreshTokenRepo = connection.getRepository(RefreshToken);
      // const refreshTokens = await refreshTokenRepo.find();

      const tokens = await refreshTokenRepo.find();

      // Assert
      expect(tokens).toHaveLength(0);
    });
  });

  describe("Fields are missing", () => {
    it("should return 401 status code if access or refresh token is not present", async () => {
      // Arrange

      // Act
      const response = await request(app)
        .post("/auth/logout")
        .set("Cookie", [`accessToken=${""}`, `refreshToken=${""}`])
        .send();

      // Assert
      expect(response.statusCode).toBe(401);
    });
  });
});
