import { z } from "zod";
import { badRequest } from "./errors.js";

export function parse<T extends z.ZodType>(schema: T, data: unknown): z.infer<T> {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw badRequest("Données invalides", z.flattenError(result.error));
  }
  return result.data;
}

export const idParam = z.object({ id: z.string().min(1) });
