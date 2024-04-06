import request from "supertest";
import createJWKSMock, { JWKSMock } from "mock-jwks";
import { DataSource } from "typeorm";
import { sign } from "jsonwebtoken";

import app from "../../src/app";
import { User } from "../../src/entity/User";
import { AppDataSource } from "../../src/config/data-source";
import { Roles } from "../../src/constants";
import { RefreshToken } from "../../src/entity/RefreshToken";
import { Config } from "../../src/config";
import { isJwt } from "../utils";

describe("GET /auth/refresh", () => {
  let connection: DataSource;
  let jwks: JWKSMock;
  let user: User;
  let refreshTokenData: RefreshToken;
  let accessToken: string;
  let refreshToken: string;

  beforeAll(async () => {
    jwks = createJWKSMock("http:localhost:5501");
    connection = await AppDataSource.initialize();
  });

  beforeEach(async () => {
    jwks.start();
    await connection.dropDatabase();
    await connection.synchronize();

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

    user = await userRepository.save(userData);
    refreshTokenData = await refreshTokenRepository.save({
      user: user,
      expiresAt: new Date(Date.now() + MS_IN_YEAR),
    });

    const payload = {
      sub: String(user.id),
      role: user.role,
    };

    accessToken = jwks.token(payload);

    refreshToken = sign(
      { ...payload, id: String(refreshTokenData.id) },
      Config.REFRESH_TOKEN_SECRET!,
      {
        algorithm: "HS256",
        expiresIn: "1y",
        issuer: "auth-service",
        jwtid: String(refreshTokenData.id),
      },
    );
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

      // Act
      const response = await request(app)
        .post("/auth/refresh")
        .set("Cookie", [
          `accessToken=${accessToken}`,
          `refreshToken=${refreshToken}`,
        ])
        .send({});

      // Assert
      expect(response.statusCode).toBe(200);
    });

    it("should return 401 status code if token is revoked", async () => {
      // Arrange
      const refreshTokenRepository = connection.getRepository(RefreshToken);
      await refreshTokenRepository
        .createQueryBuilder()
        .delete()
        .from(RefreshToken)
        .where("userId = :userId", { userId: user.id })
        .execute();

      // Act
      const response = await request(app)
        .post("/auth/refresh")
        .set("Cookie", [
          `accessToken=${accessToken}`,
          `refreshToken=${refreshToken}`,
        ])
        .send({});

      // Assert
      expect(response.statusCode).toBe(401);
    });

    it("should return id of the user", async () => {
      // Arrange

      // Act
      const response = await request(app)
        .post("/auth/refresh")
        .set("Cookie", [
          `accessToken=${accessToken}`,
          `refreshToken=${refreshToken}`,
        ])
        .send({});

      // Assert
      expect(response.body).toHaveProperty("id");
      expect((response.body as Record<string, string>).id).toBe(user.id);
    });

    it("should return access & refresh token in cookies", async () => {
      // Arrange

      // Act
      const response = await request(app)
        .post("/auth/refresh")
        .set("Cookie", [
          `accessToken=${accessToken}`,
          `refreshToken=${refreshToken}`,
        ])
        .send({});

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
      expect(newAccessToken).not.toBeNull();
      expect(newRefreshToken).not.toBeNull();

      expect(isJwt(newAccessToken)).toBeTruthy();
      expect(isJwt(newRefreshToken)).toBeTruthy();
    });

    it("should delete the previous refresh token & persist new one", async () => {
      // Arrange

      // Act
      const refreshTokenRepository = connection.getRepository(RefreshToken);

      await request(app)
        .post("/auth/refresh")
        .set("Cookie", [
          `accessToken=${accessToken}`,
          `refreshToken=${refreshToken}`,
        ])
        .send({});

      const refreshTokens = await refreshTokenRepository.find();

      // Assert
      expect(refreshTokens).toHaveLength(1);
    });
  });

  describe("Fields are missing", () => {
    it("should return 401 status code if refresh token is not present", async () => {
      // Arrange

      // Act
      const response = await request(app).post("/auth/refresh").send();

      // Assert
      expect(response.statusCode).toBe(401);
    });
  });
});
