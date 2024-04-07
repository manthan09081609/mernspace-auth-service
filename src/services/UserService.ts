import bcrypt from "bcrypt";
import { Repository } from "typeorm";
import createHttpError from "http-errors";

import { User } from "../entity/User";
import { UpdateUserData, UserData } from "../types";
import { Roles } from "../constants";

export class UserService {
  constructor(private userRepository: Repository<User>) {}

  async create({
    firstName,
    lastName,
    email,
    password,
    role,
    tenantId,
  }: UserData) {
    if (role === Roles.MANAGER && !tenantId) {
      const err = createHttpError(401, "tenantId is required");
      throw err;
    }

    let user;
    try {
      user = await this.userRepository.findOne({
        where: { email: email },
      });
    } catch (error) {
      const err = createHttpError(400, "error while registering the user");
      throw err;
    }

    if (user) {
      const err = createHttpError(400, "email is already exists!");
      throw err;
    }

    try {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      return await this.userRepository.save({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role,
        tenant: tenantId ? { id: tenantId } : undefined,
      });
    } catch (error) {
      const databaseError = createHttpError(
        500,
        "failed to store the user in database",
      );
      throw databaseError;
    }
  }

  async findByEmailWithPassword(email: string) {
    return await this.userRepository.findOne({
      where: {
        email,
      },
      select: ["id", "firstName", "lastName", "email", "role", "password"],
      relations: {
        tenant: true,
      },
    });
  }

  async findById(id: number) {
    try {
      const user = await this.userRepository.findOne({
        where: { id: id },
        relations: {
          tenant: true,
        },
      });
      return user;
    } catch (error) {
      const err = createHttpError(500, "database error");
      throw err;
    }
  }

  async deleteById(id: number) {
    try {
      const user = await this.userRepository.delete({ id: id });
      return user;
    } catch (error) {
      const err = createHttpError(500, "database error");
      throw err;
    }
  }

  async getUsers() {
    try {
      return await this.userRepository.find({
        relations: {
          tenant: true,
        },
      });
    } catch (error) {
      const databaseError = createHttpError(500, "failed to get users");
      throw databaseError;
    }
  }

  async getUser(id: number) {
    try {
      return await this.userRepository.findOne({
        where: { id: id },
        relations: { tenant: true },
      });
    } catch (error) {
      const databaseError = createHttpError(500, "failed to get user");
      throw databaseError;
    }
  }

  async update(
    id: string,
    { email, firstName, lastName, role, tenantId }: UpdateUserData,
  ) {
    try {
      return await this.userRepository.update(id, {
        email,
        firstName,
        lastName,
        role,
        tenant: tenantId ? { id: tenantId } : undefined,
      });
    } catch (error) {
      const databaseError = createHttpError(
        500,
        "failed to update the user in database",
      );
      throw databaseError;
    }
  }

  async delete(id: string) {
    try {
      return await this.userRepository.delete(Number(id));
    } catch (error) {
      const databaseError = createHttpError(
        500,
        "failed to delete the user from database",
      );
      throw databaseError;
    }
  }
}
