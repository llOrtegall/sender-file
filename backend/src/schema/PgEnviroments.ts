import z from "zod";

const PgEnviroments = z.object({
  PG_HOST: z.string().min(1, "PG_HOST is required"),
  PG_PORT: z.string().transform((val) => parseInt(val, 10)),
  PG_USER: z.string().min(1, "PG_USER is required"),
  PG_PASSWORD: z.string().min(1, "PG_PASSWORD is required"),
  PG_DATABASE: z.string().min(1, "PG_DATABASE is required"),
  PG_SCHEMA: z.string().min(1, "PG_SCHEMA is required"),
});

const { success, data, error } = PgEnviroments.safeParse(process.env);

if (!success) {
  console.error("❌ Invalid environment variables:", error.format());
  process.exit(1);
}

export const {
  PG_HOST,
  PG_PORT,
  PG_USER,
  PG_PASSWORD,
  PG_DATABASE,
  PG_SCHEMA,
} = data;
