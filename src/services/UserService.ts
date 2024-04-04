import { Repository } from "typeorm";
import { User } from "../entity/User";
import { UserRegisterationData } from "../types";
import createHttpError from "http-errors";

export class UserService {
  constructor(private userRepository: Repository<User>) {}
  async create({
    firstName,
    lastName,
    email,
    password,
  }: UserRegisterationData) {
    try {
      return await this.userRepository.save({
        firstName,
        lastName,
        email,
        password,
      });
    } catch (err) {
      const databaseError = createHttpError(
        500,
        "failed to store the user in database",
      );
      throw databaseError;
    }
  }
}
