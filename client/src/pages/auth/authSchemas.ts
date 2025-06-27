import { z } from "zod";
import { insertUserSchema as sharedInsertUserSchema } from "@shared/schema";

export const loginSchema = z.object({
  username: z.string().min(1, "validation.username.required"),
  password: z.string().min(1, "validation.password.required"),
  rememberMe: z.boolean().default(false),
});

// Register şeması
const baseRegisterFields = sharedInsertUserSchema.pick({
    fullName: true,
    username: true,
    email: true,
    password: true,
    address: true,
});

export const registerSchema = baseRegisterFields.extend({
  confirmPassword: z.string().min(1, "validation.confirmPassword.required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "validation.passwords.noMatch",
  path: ["confirmPassword"],
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type RegisterPayload = Omit<RegisterFormValues, 'confirmPassword'>; 