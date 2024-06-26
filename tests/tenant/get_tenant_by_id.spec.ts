import request from "supertest";
import { DataSource } from "typeorm";

import { AppDataSource } from "../../src/config/data-source";
import app from "../../src/app";
import { Tenant } from "../../src/entity/Tenant";
import { Roles } from "../../src/constants";
import { User } from "../../src/entity/User";
import createJWKSMock, { JWKSMock } from "mock-jwks";

describe("GET /tenants/:id", () => {
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
        role: Roles.ADMIN,
      };
      const tenantData = {
        name: "tenant",
        address: "tenantAddress",
      };

      // Act
      const userRepository = connection.getRepository(User);
      const admin = await userRepository.save(userData);

      const tenantRepository = connection.getRepository(Tenant);

      const accessToken = jwks.token({
        sub: String(admin.id),
        role: admin.role,
      });

      const tenant = await tenantRepository.save(tenantData);

      // Act

      const response = await request(app)
        .get(`/tenants/${tenant.id}`)
        .set("Cookie", [`accessToken=${accessToken}`])
        .send();

      // Assert
      expect(response.statusCode).toBe(200);
    });

    it("should return a tenant", async () => {
      // Arrange
      const userData = {
        firstName: "Manthan",
        lastName: "Sharma",
        email: "manthan@gmail.com",
        password: "password",
        role: Roles.ADMIN,
      };
      const tenantData = {
        name: "tenant",
        address: "tenantAddress",
      };

      // Act
      const userRepository = connection.getRepository(User);
      const admin = await userRepository.save(userData);

      const tenantRepository = connection.getRepository(Tenant);

      const accessToken = jwks.token({
        sub: String(admin.id),
        role: admin.role,
      });

      const tenant = await tenantRepository.save(tenantData);

      // Act

      const response = await request(app)
        .get(`/tenants/${tenant.id}`)
        .set("Cookie", [`accessToken=${accessToken}`])
        .send();

      // Assert
      expect((response.body as Record<string, string>).name).toBe(
        tenantData.name,
      );
      expect((response.body as Record<string, string>).address).toBe(
        tenantData.address,
      );
    });

    it.skip("should return 401 status code if user is not authenticated", async () => {
      // Arrange
      const userData = {
        firstName: "Manthan",
        lastName: "Sharma",
        email: "manthan@gmail.com",
        password: "password",
        role: Roles.ADMIN,
      };

      // Act
      const userRepository = connection.getRepository(User);
      const admin = await userRepository.save(userData);

      const tenantRepository = connection.getRepository(Tenant);

      const accessToken = jwks.token({
        sub: String(admin.id),
        role: admin.role,
      });

      const tenantId = "1223";

      // Act

      const response = await request(app)
        .get(`/tenants/${tenantId}}`)
        .set("Cookie", [`accessToken=${accessToken}`])
        .send();
      const tenant = await tenantRepository.findOne({
        where: { id: Number(tenantId) },
      });

      // Assert
      expect(response.statusCode).toBe(400);
      expect(tenant).toBeNull();
    });

    it.skip("should return 403 status code if user is not admin", async () => {
      // Arrange
      const userData = {
        firstName: "Manthan",
        lastName: "Sharma",
        email: "manthan@gmail.com",
        password: "password",
        role: Roles.ADMIN,
      };

      // Act
      const userRepository = connection.getRepository(User);
      const admin = await userRepository.save(userData);

      const tenantRepository = connection.getRepository(Tenant);

      const accessToken = jwks.token({
        sub: String(admin.id),
        role: admin.role,
      });

      const tenantId = "1223";

      // Act

      const response = await request(app)
        .get(`/tenants/${tenantId}}`)
        .set("Cookie", [`accessToken=${accessToken}`])
        .send();
      const tenant = await tenantRepository.findOne({
        where: { id: Number(tenantId) },
      });

      // Assert
      expect(response.statusCode).toBe(400);
      expect(tenant).toBeNull();
    });

    it("should return 400 status code if tennat id is not valid", async () => {
      // Arrange
      const userData = {
        firstName: "Manthan",
        lastName: "Sharma",
        email: "manthan@gmail.com",
        password: "password",
        role: Roles.ADMIN,
      };
      const tenantData = {
        name: "tenant",
        address: "tenantAddress",
      };

      // Act
      const userRepository = connection.getRepository(User);
      const admin = await userRepository.save(userData);

      const tenantRepository = connection.getRepository(Tenant);

      const accessToken = jwks.token({
        sub: String(admin.id),
        role: admin.role,
      });

      await tenantRepository.save(tenantData);

      // Act

      const response = await request(app)
        .get(`/tenants/${"hdhgdh"}`)
        .set("Cookie", [`accessToken=${accessToken}`])
        .send();

      // Assert
      expect(response.statusCode).toBe(400);
    });

    it("should return 400 status code if tenant is not present", async () => {
      // Arrange
      const userData = {
        firstName: "Manthan",
        lastName: "Sharma",
        email: "manthan@gmail.com",
        password: "password",
        role: Roles.ADMIN,
      };

      // Act
      const userRepository = connection.getRepository(User);
      const admin = await userRepository.save(userData);

      const tenantRepository = connection.getRepository(Tenant);

      const accessToken = jwks.token({
        sub: String(admin.id),
        role: admin.role,
      });

      const tenantId = "1223";

      // Act

      const response = await request(app)
        .get(`/tenants/${tenantId}}`)
        .set("Cookie", [`accessToken=${accessToken}`])
        .send();
      const tenant = await tenantRepository.findOne({
        where: { id: Number(tenantId) },
      });

      // Assert
      expect(response.statusCode).toBe(400);
      expect(tenant).toBeNull();
    });
  });

  describe("Fields are missing", () => {});

  describe("Fields are not in proper format", () => {});
});
