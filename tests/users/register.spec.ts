import request from "supertest";
import { DataSource } from "typeorm";

import app from "../../src/app";
import { User } from "../../src/entity/User";
import { AppDataSource } from "../../src/config/data-source";
import { Roles } from "../../src/constants";

describe("POST /auth/register", () => {
  let connection: DataSource;

  beforeAll(async () => {
    connection = await AppDataSource.initialize();
  });

  beforeEach(async () => {
    await connection.dropDatabase();
    await connection.synchronize();
  });

  afterAll(async () => {
    await connection.destroy();
  });

  describe("All fields given", () => {
    it("should return 201 status code", async () => {
      // Arrange
      const userData = {
        firstName: "Manthan",
        lastName: "Sharma",
        email: "manthan@gmail.com",
        password: "password",
      };

      // Act
      const response = await request(app).post("/auth/register").send(userData);

      // Assert
      expect(response.statusCode).toBe(201);
    });

    it("should return valid json response", async () => {
      // Arrange
      const userData = {
        firstName: "Manthan",
        lastName: "Sharma",
        email: "manthan@gmail.com",
        password: "password",
      };

      // Act
      const response = await request(app).post("/auth/register").send(userData);

      // Assert
      expect(
        (response.headers as Record<string, string>)["content-type"],
      ).toEqual(expect.stringContaining("json"));
    });

    it("should persist user in database", async () => {
      // Arrange
      const userData = {
        firstName: "Manthan",
        lastName: "Sharma",
        email: "manthan@gmail.com",
        password: "password",
      };

      // Act
      await request(app).post("/auth/register").send(userData);

      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();

      // Assert
      expect(users).toHaveLength(1);
      expect(users[0].firstName).toBe(userData.firstName);
      expect(users[0].lastName).toBe(userData.lastName);
      expect(users[0].email).toBe(userData.email);
    });

    it("should return id of created user", async () => {
      // Arrange
      const userData = {
        firstName: "Manthan",
        lastName: "Sharma",
        email: "manthan@gmail.com",
        password: "password",
      };

      // Act
      const response = await request(app).post("/auth/register").send(userData);

      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();

      // Assert
      expect(response.body).toHaveProperty("id");
      expect((response.body as Record<string, string>).id).toBe(users[0].id);
    });

    it("should assign a customer role to registering user", async () => {
      // Arrange
      const userData = {
        firstName: "Manthan",
        lastName: "Sharma",
        email: "manthan@gmail.com",
        password: "password",
      };

      // Act
      await request(app).post("/auth/register").send(userData);

      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();

      // Assert
      expect(users[0]).toHaveProperty("role");
      expect(users[0].role).toBe(Roles.CUSTOMER);
    });

    it("should store hashed password in database", async () => {
      // Arrange
      const userData = {
        firstName: "Manthan",
        lastName: "Sharma",
        email: "manthan@gmail.com",
        password: "password",
      };

      // Act
      await request(app).post("/auth/register").send(userData);

      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();

      // Assert
      expect(users[0].password).not.toBe(userData.password);
      expect(users[0].password).toHaveLength(60);
      expect(users[0].password).toMatch(/^\$(2b|2a)\$\d+\$/);
    });

    it("should return 400 status code if email already exists", async () => {
      // Arrange
      const userData = {
        firstName: "Manthan",
        lastName: "Sharma",
        email: "manthan@gmail.com",
        password: "password",
      };

      // Act
      const userRepository = connection.getRepository(User);
      await userRepository.save({ ...userData, role: Roles.CUSTOMER });

      const response = await request(app).post("/auth/register").send(userData);

      const users = await userRepository.find();

      // Assert
      expect(response.statusCode).toBe(400);
      expect(users.length).toBe(1);
    });
  });
  describe("Fields are missing", () => {});
});
