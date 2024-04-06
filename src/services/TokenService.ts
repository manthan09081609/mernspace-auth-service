import fs from "fs";
import createHttpError from "http-errors";
import { JwtPayload, sign } from "jsonwebtoken";
import path from "path";
import { RefreshToken } from "../entity/RefreshToken";
import { Repository } from "typeorm";
import { User } from "../entity/User";
import { Config } from "../config";
import { RefreshTokenData } from "../types";

export class TokenService {
  constructor(private refreshTokenRepository: Repository<RefreshToken>) {}

  generateAccessToken(payload: JwtPayload): string {
    let privateKey: Buffer;

    try {
      privateKey = fs.readFileSync(
        path.join(__dirname, "../../certs/private.pem"),
      );

      const accessToken = sign(payload, privateKey, {
        algorithm: "RS256",
        expiresIn: "1h",
        issuer: "auth-service",
      });

      return accessToken;
    } catch (err) {
      const error = createHttpError(500, "error while generating token");
      throw error;
    }
  }

  async generateRefreshToken(payload: JwtPayload, user: User): Promise<string> {
    try {
      const refreshTokenData = await this.persistRefreshToken(user);

      const refreshToken = sign(
        { ...payload, id: String(refreshTokenData.id) },
        Config.REFRESH_TOKEN_SECRET!,
        {
          algorithm: "HS256",
          expiresIn: "1y",
          issuer: "auth-service",
          jwtid: String(refreshTokenData.id),
        },
      );

      return refreshToken;
    } catch (err) {
      const error = createHttpError(500, "error while generating token");
      throw error;
    }
  }

  async persistRefreshToken(user: User): Promise<RefreshTokenData> {
    try {
      const MS_IN_YEAR = 1000 * 60 * 60 * 24 * 365;

      const refreshTokenData = await this.refreshTokenRepository.save({
        user: user,
        expiresAt: new Date(Date.now() + MS_IN_YEAR),
      });

      const data = {
        id: refreshTokenData.id,
      };

      return data;
    } catch (err) {
      const error = createHttpError(
        500,
        "error while persisting token in database",
      );
      throw error;
    }
  }

  async deleteRefreshTokens(userId: number) {
    try {
      return await this.refreshTokenRepository
        .createQueryBuilder()
        .delete()
        .from(RefreshToken)
        .where("userId = :userId", { userId })
        .execute();
    } catch (err) {
      const error = createHttpError(500, "database error");
      throw error;
    }
  }

  async revokeRefreshToken(tokenId: number) {
    try {
      return await this.refreshTokenRepository.delete({ id: tokenId });
    } catch (err) {
      const error = createHttpError(500, "database error");
      throw error;
    }
  }
}
