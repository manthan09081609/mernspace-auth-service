import { Repository } from "typeorm";
import { User } from "../entity/User";
import { UserRegisterationData } from "../types";

export class UserService {
  constructor(private userRepository: Repository<User>) {}
  async create({
    firstName,
    lastName,
    email,
    password,
  }: UserRegisterationData) {
    await this.userRepository.save({ firstName, lastName, email, password });
  }
}
