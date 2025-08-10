import { z } from "zod";

export type RegisterSchema = z.infer<typeof registerSchema>;

export const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  firstName: z.string().min(1),
  password: z.string().min(8),
});
