import path from "path";

import { config } from "dotenv";

config({
  path: path.join(__dirname, `../../.env.${process.env.NODE_ENV}`),
});

const {
  PORT,
  NODE_ENV,
  DB_NAME,
  DB_HOST,
  DB_PORT,
  DB_USERNAME,
  DB_PASSWORD,
  REFRESH_TOKEN_SECRET,
  JWKS_URI,
} = process.env;

export const Config = {
  PORT,
  NODE_ENV,
  DB_NAME,
  DB_HOST,
  DB_PORT,
  DB_USERNAME,
  DB_PASSWORD,
  REFRESH_TOKEN_SECRET,
  JWKS_URI,
};
