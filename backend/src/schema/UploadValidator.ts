import { treeifyError } from "zod/v4/core";
import z from "zod";

const uploadSchema = z.object({
  fileName: z.string().min(1, "File name cannot be empty"),
  contentType: z.string().min(1, "Content type cannot be empty"),
  expectedSize: z.number().min(1, "File size must be greater than 0"),
});

export const validateUpload = (data: unknown) => {
  const { success, data: validatedData, error } = uploadSchema.safeParse(data);

  if (!success) {
    throw new Error(`Validation error: ${treeifyError(error)}`);
  }
  return validatedData;
};
