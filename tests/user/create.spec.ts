import request from "supertest";
import { DataSource } from "typeorm";

import { AppDataSource } from "../../src/config/data-source";
import app from "../../src/app";
import { Tenant } from "../../src/entity/Tenant";
import createJWKSMock, { JWKSMock } from "mock-jwks";
import { User } from "../../src/entity/User";
import { Roles } from "../../src/constants";

describe("POST /users/create", () => {
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
    it("should return 201 status code", async () => {
      // Arrange
      const managerData = {
        firstName: "Manthan",
        lastName: "Sharma",
        email: "manthan@gmail.com",
        password: "password",
        role: Roles.MANAGER,
      };

      const tenantData = {
        name: "tenant",
        address: "tenantAddress",
      };

      const adminData = {
        firstName: "admin",
        lastName: "1",
        email: "admin@gmail.com",
        password: "password",
        role: Roles.ADMIN,
      };
      const userRepository = connection.getRepository(User);
      const tenantRepository = connection.getRepository(Tenant);

      const admin = await userRepository.save(adminData);
      const tenant = await tenantRepository.save(tenantData);

      const accessToken = jwks.token({
        sub: String(admin.id),
        role: admin.role,
      });

      // Act

      const response = await request(app)
        .post("/users/create")
        .set("Cookie", [`accessToken=${accessToken}`])
        .send({ ...managerData, tenantId: tenant.id });

      // Assert
      expect(response.statusCode).toBe(201);
    });

    it("should store manager in the database", async () => {
      // Arrange
      const managerData = {
        firstName: "Manthan",
        lastName: "Sharma",
        email: "manthan@gmail.com",
        password: "password",
        role: Roles.MANAGER,
      };

      const tenantData = {
        name: "tenant",
        address: "tenantAddress",
      };

      const adminData = {
        firstName: "admin",
        lastName: "1",
        email: "admin@gmail.com",
        password: "password",
        role: Roles.ADMIN,
      };
      const userRepository = connection.getRepository(User);
      const tenantRepository = connection.getRepository(Tenant);

      const admin = await userRepository.save(adminData);
      const tenant = await tenantRepository.save(tenantData);

      const accessToken = jwks.token({
        sub: String(admin.id),
        role: admin.role,
      });

      // Act

      const response = await request(app)
        .post("/users/create")
        .set("Cookie", [`accessToken=${accessToken}`])
        .send({ ...managerData, tenantId: tenant.id });

      const users = await userRepository.find();

      // Assert
      expect(response.body).toHaveProperty("id");
      expect(users.length).toBe(2);
    });

    it("should return 401 if user is not authenticated", async () => {
      // Arrange
      const managerData = {
        firstName: "Manthan",
        lastName: "Sharma",
        email: "manthan@gmail.com",
        password: "password",
        role: Roles.MANAGER,
      };

      const tenantData = {
        name: "tenant",
        address: "tenantAddress",
      };

      const adminData = {
        firstName: "admin",
        lastName: "1",
        email: "admin@gmail.com",
        password: "password",
        role: Roles.ADMIN,
      };
      const userRepository = connection.getRepository(User);
      const tenantRepository = connection.getRepository(Tenant);

      await userRepository.save(adminData);
      const tenant = await tenantRepository.save(tenantData);

      // Act

      const response = await request(app)
        .post("/users/create")
        .send({ ...managerData, tenantId: tenant.id });

      const users = await userRepository.find();

      // Assert
      expect(response.statusCode).toBe(401);
      expect(users.length).toBe(1);
    });

    it("should return 403 if user is not an admin", async () => {
      // Arrange
      const managerData = {
        firstName: "Manthan",
        lastName: "Sharma",
        email: "manthan@gmail.com",
        password: "password",
        role: Roles.MANAGER,
      };

      const tenantData = {
        name: "tenant",
        address: "tenantAddress",
      };

      const userData = {
        firstName: "admin",
        lastName: "1",
        email: "admin@gmail.com",
        password: "password",
        role: Roles.CUSTOMER,
      };
      const userRepository = connection.getRepository(User);
      const tenantRepository = connection.getRepository(Tenant);

      const user = await userRepository.save(userData);
      const tenant = await tenantRepository.save(tenantData);

      const accessToken = jwks.token({
        sub: String(user.id),
        role: user.role,
      });
      // Act

      const response = await request(app)
        .post("/users/create")
        .set("Cookie", [`accessToken=${accessToken}`])
        .send({ ...managerData, tenantId: tenant.id });

      const users = await userRepository.find();

      // Assert
      expect(response.statusCode).toBe(403);
      expect(users.length).toBe(1);
    });

    it("should return 403 if created user role is not manager", async () => {
      // Arrange
      const userData = {
        firstName: "Manthan",
        lastName: "Sharma",
        email: "manthan@gmail.com",
        password: "password",
        role: Roles.CUSTOMER,
      };

      const tenantData = {
        name: "tenant",
        address: "tenantAddress",
      };

      const adminData = {
        firstName: "admin",
        lastName: "1",
        email: "admin@gmail.com",
        password: "password",
        role: Roles.ADMIN,
      };
      const userRepository = connection.getRepository(User);
      const tenantRepository = connection.getRepository(Tenant);

      const admin = await userRepository.save(adminData);
      const tenant = await tenantRepository.save(tenantData);

      const accessToken = jwks.token({
        sub: String(admin.id),
        role: admin.role,
      });

      // Act

      const response = await request(app)
        .post("/users/create")
        .set("Cookie", [`accessToken=${accessToken}`])
        .send({ ...userData, tenantId: tenant.id });

      const users = await userRepository.find();

      // Assert
      expect(response.statusCode).toBe(403);
      expect(users.length).toBe(1);
    });
  });

  describe("Fields are missing", () => {});

  describe("Fields are not in proper format", () => {});
});
