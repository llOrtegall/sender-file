import { Sequelize } from "sequelize";
import {
  PG_DATABASE,
  PG_HOST,
  PG_PASSWORD,
  PG_PORT,
  PG_SCHEMA,
  PG_USER,
} from "../schema/PgEnviroments";

const pgConn = new Sequelize(PG_DATABASE, PG_USER, PG_PASSWORD, {
  host: PG_HOST,
  port: PG_PORT,
  dialect: "postgres",
  schema: PG_SCHEMA,
});

export { pgConn };
