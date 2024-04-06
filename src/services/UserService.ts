import bcrypt from "bcrypt";
import { Repository } from "typeorm";
import createHttpError from "http-errors";

import { User } from "../entity/User";
import { UserRegisterationData } from "../types";
import { Roles } from "../constants";

export class UserService {
  constructor(private userRepository: Repository<User>) {}

  async create({
    firstName,
    lastName,
    email,
    password,
  }: UserRegisterationData) {
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
        role: Roles.CUSTOMER,
      });
    } catch (error) {
      const databaseError = createHttpError(
        500,
        "failed to store the user in database",
      );
      throw databaseError;
    }
  }

  async findByEmail(email: string) {
    try {
      const user = await this.userRepository.findOne({
        where: { email: email },
      });
      return user;
    } catch (error) {
      const err = createHttpError(500, "database error");
      throw err;
    }
  }

  async findById(id: number) {
    try {
      const user = await this.userRepository.findOne({ where: { id: id } });
      return user;
    } catch (error) {
      const err = createHttpError(500, "database error");
      throw err;
    }
  }
}
