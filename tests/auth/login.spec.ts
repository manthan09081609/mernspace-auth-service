import request from "supertest";
import { DataSource } from "typeorm";

import app from "../../src/app";
import { User } from "../../src/entity/User";
import { AppDataSource } from "../../src/config/data-source";
import { isJwt } from "../utils";
import { RefreshToken } from "../../src/entity/RefreshToken";

describe("POST /auth/login", () => {
  let connection: DataSource;

  beforeAll(async () => {
    connection = await AppDataSource.initialize();
  });

  beforeEach(async () => {
    await connection.dropDatabase();
    await connection.synchronize();

    const userData = {
      firstName: "Manthan",
      lastName: "Sharma",
      email: "manthan@gmail.com",
      password: "password",
    };

    // Act
    await request(app).post("/auth/register").send(userData);
  });

  afterAll(async () => {
    await connection.destroy();
  });

  describe("All fields given", () => {
    it("should return 200 status code", async () => {
      // Arrange
      const userData = {
        email: "manthan@gmail.com",
        password: "password",
      };

      // Act
      const response = await request(app).post("/auth/login").send(userData);

      // Assert
      expect(response.statusCode).toBe(200);
    });

    it("should return valid json response", async () => {
      // Arrange
      const userData = {
        email: "manthan@gmail.com",
        password: "password",
      };

      // Act
      const response = await request(app).post("/auth/login").send(userData);

      // Assert
      expect(
        (response.headers as Record<string, string>)["content-type"],
      ).toEqual(expect.stringContaining("json"));
    });

    it("should return id of logged in user", async () => {
      // Arrange
      const userData = {
        email: "manthan@gmail.com",
        password: "password",
      };

      // Act
      const response = await request(app).post("/auth/login").send(userData);

      const userRepository = connection.getRepository(User);
      const user = await userRepository.findOne({
        where: { email: userData.email },
      });

      // Assert
      expect(response.body).toHaveProperty("id");
      expect((response.body as Record<string, string>).id).toBe(user!.id);
    });

    it("should return 400 status code if email or password do not match", async () => {
      // Arrange
      const userData = {
        email: "manthank@gmail.com",
        password: "password",
      };

      // Act

      const response = await request(app).post("/auth/login").send(userData);

      // Assert
      expect(response.statusCode).toBe(400);
    });

    it("should return access & refresh token in cookies", async () => {
      // Arrange
      const userData = {
        email: "manthan@gmail.com",
        password: "password",
      };

      // Act
      const response = await request(app).post("/auth/login").send(userData);

      let accessToken = null;
      let refreshToken = null;
      interface Headers {
        ["set-cookie"]: string[];
      }
      const cookies =
        (response.headers as unknown as Headers)["set-cookie"] || [];

      cookies.forEach((cookie) => {
        if (cookie.startsWith("accessToken")) {
          accessToken = cookie.split(";")[0].split("=")[1];
        }
        if (cookie.startsWith("refreshToken")) {
          refreshToken = cookie.split(";")[0].split("=")[1];
        }
      });

      // Assert
      expect(accessToken).not.toBeNull();
      expect(refreshToken).not.toBeNull();

      expect(isJwt(accessToken)).toBeTruthy();
      expect(isJwt(refreshToken)).toBeTruthy();
    });

    it("should store refresh token in database", async () => {
      // Arrange
      const userData = {
        email: "manthan@gmail.com",
        password: "password",
      };

      // Act
      const response = await request(app).post("/auth/login").send(userData);

      const refreshTokenRepo = connection.getRepository(RefreshToken);
      // const refreshTokens = await refreshTokenRepo.find();

      const tokens = await refreshTokenRepo
        .createQueryBuilder("refreshToken")
        .where("refreshToken.userId = :userId", {
          userId: (response.body as Record<string, string>).id,
        })
        .getMany();

      // Assert
      // expect(refreshTokens).toHaveLength(1);
      // expect(tokens).toHaveLength(1);
      expect(tokens).toHaveLength(2);
    });
  });

  describe("Fields are missing", () => {
    it("should return 400 status code if email field not present", async () => {
      // Arrange
      const userData = {
        email: "",
        password: "password",
      };

      // Act
      const response = await request(app).post("/auth/login").send(userData);

      // Assert
      expect(response.statusCode).toBe(400);
    });

    it("should return 400 status code if password field not present", async () => {
      // Arrange
      const userData = {
        email: "manthan@gmail.com",
        password: "",
      };

      // Act
      const response = await request(app).post("/auth/login").send(userData);

      // Assert
      expect(response.statusCode).toBe(400);
    });
  });

  describe("Fields are not in proper format", () => {
    it("should trim the email", async () => {
      // Arrange
      const userData = {
        email: " manthan@gmail.com ",
        password: "password",
      };

      // Act
      const userRepository = connection.getRepository(User);
      await request(app).post("/auth/register").send(userData);
      const users = await userRepository.find();

      // Assert
      const user = users[0];
      expect(user.email).toBe("manthan@gmail.com");
    });

    it("should return 400 status code if email is not a valid email", async () => {
      // Arrange
      const userData = {
        email: "manthangmail.com",
        password: "password",
      };

      // Act
      const response = await request(app).post("/auth/login").send(userData);

      // Assert
      expect(response.statusCode).toBe(400);
    });

    it("should return 400 status code if password length is less than 8 characters", async () => {
      // Arrange
      const userData = {
        email: "manthan@gmail.com",
        password: "passwor",
      };

      // Act
      const response = await request(app).post("/auth/login").send(userData);

      // Assert
      expect(response.statusCode).toBe(400);
    });

    it("should return array of error messages if email is missing", async () => {
      // Arrange
      const userData = {
        email: "",
        password: "password",
      };

      // Act
      const response = await request(app).post("/auth/login").send(userData);

      // Assert
      expect(response.statusCode).toBe(400);
      expect(
        (response.body as Record<string, string>).errors.length,
      ).toBeGreaterThan(1);
    });
  });
});
