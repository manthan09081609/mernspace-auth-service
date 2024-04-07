import { Repository } from "typeorm";
import createHttpError from "http-errors";

import { TenantData } from "../types";
import { Tenant } from "../entity/Tenant";

export class TenantService {
  constructor(private tenantRepository: Repository<Tenant>) {}

  async create({ name, address }: TenantData) {
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

  async getTenants() {
    try {
      return await this.tenantRepository.find();
    } catch (error) {
      const databaseError = createHttpError(500, "failed to get tenants");
      throw databaseError;
    }
  }

  async getTenant(id: number) {
    try {
      return await this.tenantRepository.findOne({ where: { id: id } });
    } catch (error) {
      const databaseError = createHttpError(500, "failed to get tenant");
      throw databaseError;
    }
  }

  async update(id: string, { name, address }: TenantData) {
    try {
      return await this.tenantRepository.update(id, {
        name: name,
        address: address,
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
      return await this.tenantRepository.delete(Number(id));
    } catch (error) {
      const databaseError = createHttpError(
        500,
        "failed to delete the user from database",
      );
      throw databaseError;
    }
  }
}
