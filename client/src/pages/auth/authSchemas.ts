import { z } from "zod";
import { insertUserSchema as sharedInsertUserSchema } from "@shared/schema"; // Paylaşılan şemayı import et

export const loginSchema = z.object({
  username: z.string().min(1, "validation.username.required"), // Çeviri anahtarları kullanıldı
  password: z.string().min(1, "validation.password.required"),
  rememberMe: z.boolean().default(false),
});

// sharedInsertUserSchema'nın bir fonksiyon olup olmadığını kontrol etmek için log ekleyebiliriz.
// console.log('Inspecting sharedInsertUserSchema:', typeof sharedInsertUserSchema, sharedInsertUserSchema);
// console.log('Does it have pick?', typeof sharedInsertUserSchema?.pick);

// Register şeması
const baseRegisterFields = sharedInsertUserSchema.pick({
    fullName: true,
    username: true,
    email: true,
    password: true, // Bu şifre alanı artık paylaşılan şemadaki validasyonları içerir
    address: true,
});

export const registerSchema = baseRegisterFields.extend({
  // Frontend'e özel confirmPassword alanı
  confirmPassword: z.string().min(1, "validation.confirmPassword.required"),
  // Eğer frontend'e özel ek password validasyonu gerekiyorsa (paylaşılanı override eder):
  // password: z.string()
  //   .min(1, "validation.password.required") // Bu "required" mesajı paylaşılandan farklı olabilir
  //   .min(8, "validation.password.minLengthFrontendSpecific"), // Farklı bir uzunluk gibi
}).refine((data) => data.password === data.confirmPassword, {
  message: "validation.passwords.noMatch",
  path: ["confirmPassword"],
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;

// Backend'e gönderilecek register verisi için tip (confirmPassword olmadan)
// Bu, sharedInsertUserSchema'dan türetilebilir veya RegisterFormValues'tan omit edilebilir.
export type RegisterPayload = Omit<RegisterFormValues, 'confirmPassword'>; 