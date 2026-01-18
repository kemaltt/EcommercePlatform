import {
  pgTable,
  text,
  serial,
  integer,
  boolean,
  doublePrecision,
  timestamp,
  foreignKey,
  json,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  username: text("username").notNull().unique(),
  password: text("password"), // Nullable for social users
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  avatarUrl: text("avatar_url"),
  googleId: text("google_id").unique(),
  appleId: text("apple_id").unique(),
  isAdmin: boolean("is_admin").default(false).notNull(),
  status: text("status").default("active").notNull(), // active, passive, cancellation_request, cancelled, deleted
  address: text("address"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  emailVerificationToken: text("email_verification_token").unique(),
  verificationTokenExpiresAt: timestamp("verification_token_expires_at", {
    mode: "date",
  }),
});

export const insertUserSchema = createInsertSchema(users, {
  username: z.string().optional(),
  email: z
    .string()
    .email("validation.email.invalid")
    .min(1, "validation.email.required"),
  fullName: z.string().min(1, "validation.fullName.required"),
  password: z
    .string()
    .min(8, "validation.password.minLength")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.])[A-Za-z\d@$!%*?&.]{8,}$/,
      "validation.password.complexity",
    ),
}).omit({
  isAdmin: true,
  status: true,
});

// Product schema
export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: doublePrecision("price").notNull(),
  category: text("category").notNull(),
  imageUrl: text("image_url").notNull(),
  stock: integer("stock").notNull(),
  rating: doublePrecision("rating").default(0),
  reviews: integer("reviews").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
});

// Favorites schema
export const favorites = pgTable("favorites", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  productId: uuid("product_id").notNull(),
});

export const insertFavoriteSchema = createInsertSchema(favorites).omit({
  id: true,
});

// Cart schema
export const cartItems = pgTable("cart_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  productId: uuid("product_id").notNull(),
  quantity: integer("quantity").notNull().default(1),
});

export const insertCartItemSchema = createInsertSchema(cartItems).omit({
  id: true,
});

// Password Reset schema
export const passwordResets = pgTable(
  "password_resets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    token: text("token").notNull().unique(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table: any) => ({
    userRelation: foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "password_resets_user_id_fkey",
    }),
  }),
);

export const insertPasswordResetSchema = createInsertSchema(
  passwordResets,
).omit({
  id: true,
  createdAt: true,
});

// Addresses schema
export const addresses = pgTable("addresses", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // 'delivery', 'invoice'
  fullName: text("full_name").notNull(),
  addressLine1: text("address_line1").notNull(),
  addressLine2: text("address_line2"),
  city: text("city").notNull(),
  zipCode: text("zip_code").notNull(),
  country: text("country").notNull(),
  phoneNumber: text("phone_number"),
  isDefault: boolean("is_default").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAddressSchema = createInsertSchema(addresses).omit({
  id: true,
  createdAt: true,
});

// Orders schema
export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  orderNumber: text("order_number").notNull().unique(),
  status: text("status").notNull().default("pending"), // pending, paid, shipped, delivered, cancelled
  total: doublePrecision("total").notNull(),
  subtotal: doublePrecision("subtotal").notNull(),
  shippingCost: doublePrecision("shipping_cost").notNull().default(0),
  tax: doublePrecision("tax").notNull().default(0),
  shippingAddress: json("shipping_address").notNull(), // Snapshot of address
  shippingMethod: text("shipping_method").notNull(),
  paymentMethod: text("payment_method").notNull(),
  paymentStatus: text("payment_status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const orderItems = pgTable("order_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: uuid("product_id").notNull(),
  productName: text("product_name").notNull(),
  productImage: text("product_image").notNull(),
  quantity: integer("quantity").notNull(),
  price: doublePrecision("price").notNull(),
  options: json("options"), // Size, color etc.
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOrderItemSchema = createInsertSchema(orderItems).omit({
  id: true,
});

// Type exports
export type User = typeof users.$inferSelect & {
  defaultAddress?: Address | null;
};
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Address = typeof addresses.$inferSelect;
export type InsertAddress = z.infer<typeof insertAddressSchema>;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;
export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
export type Order = typeof orders.$inferSelect & {
  items?: OrderItem[];
};
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type PasswordReset = typeof passwordResets.$inferSelect;
export type InsertPasswordReset = z.infer<typeof insertPasswordResetSchema>;
