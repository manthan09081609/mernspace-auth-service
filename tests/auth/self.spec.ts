import request from "supertest";
import createJWKSMock, { JWKSMock } from "mock-jwks";
import { DataSource } from "typeorm";

import app from "../../src/app";
import { User } from "../../src/entity/User";
import { AppDataSource } from "../../src/config/data-source";
import { Roles } from "../../src/constants";

describe("GET /auth/self", () => {
  let connection: DataSource;
  let jwks: JWKSMock;
  let user: User;
  let accessToken: string;

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
    user = await userRepository.save(userData);

    accessToken = jwks.token({
      sub: String(user.id),
      role: user.role,
    });
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
        .get("/auth/self")
        .set("Cookie", [`accessToken=${accessToken};`])
        .send();

      // Assert
      expect(response.statusCode).toBe(200);
    });

    it("should return 401 status code if token not valid", async () => {
      // Arrange

      // Act
      const response = await request(app)
        .get("/auth/self")
        .set("Cookie", [`accessToken=${"accessToken"};`])
        .send();

      // Assert
      expect(response.statusCode).toBe(401);
    });

    it("should return user data", async () => {
      // Arrange

      // Act
      const response = await request(app)
        .get("/auth/self")
        .set("Cookie", [`accessToken=${accessToken};`])
        .send();

      // Assert
      expect((response.body as Record<string, string>).id).toBe(user.id);
    });

    it("should return not return the password field", async () => {
      // Arrange

      // Act
      const response = await request(app)
        .get("/auth/self")
        .set("Cookie", [`accessToken=${accessToken};`])
        .send();

      // Assert
      expect(response.body).not.toHaveProperty("password");
    });
  });

  describe("Fields are missing", () => {
    it("should return 401 status code if access token is not present", async () => {
      // Arrange

      // Act
      const response = await request(app).get("/auth/self").send();

      // Assert
      expect(response.statusCode).toBe(401);
    });
  });
});
