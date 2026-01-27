import { treeifyError } from "zod/v4/core";
import z from "zod";

const downloadSchema = z.object({
  shortId: z.string().min(1, "Short ID cannot be empty"),
});

export const validateDownload = (data: unknown) => {
  const {
    success,
    data: validatedData,
    error,
  } = downloadSchema.safeParse(data);

  if (!success) {
    throw new Error(`Validation error: ${treeifyError(error)}`);
  }

  return validatedData;
};
