import { Repository } from "typeorm";
import createHttpError from "http-errors";

import { TenantCreateData } from "../types";
import { Tenant } from "../entity/Tenant";

export class TenantService {
  constructor(private tenantRepository: Repository<Tenant>) {}

  async create({ name, address }: TenantCreateData) {
    let tenant;
    try {
      tenant = await this.tenantRepository.findOne({
        where: { name: name, address: address },
      });
    } catch (error) {
      const err = createHttpError(400, "error while creating the tenant");
      throw err;
    }

    if (tenant) {
      const err = createHttpError(400, "tenant is already present");
      throw err;
    }

    try {
      return await this.tenantRepository.save({
        name,
        address,
      });
    } catch (error) {
      const databaseError = createHttpError(
        500,
        "failed to store the user in database",
      );
      throw databaseError;
    }
  }
}
