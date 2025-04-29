import { pgTable, text, serial, integer, boolean, timestamp, foreignKey, primaryKey, doublePrecision, jsonb } from "drizzle-orm/pg-core";
import { relations, InferSelectModel, InferInsertModel } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Base users table - kept from the original schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  role: text("role").default("customer"), // customer, admin, technician
  language: text("language").default("es"), // es, en
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Products table - for storing auto parts
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  sku: text("sku").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  price: doublePrecision("price").notNull(),
  brand: text("brand").notNull(),
  category: text("category").notNull(),
  stock: integer("stock").notNull().default(0),
  inStock: boolean("in_stock").notNull().default(false),
  images: text("images").array().notNull().default([]),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Vehicles table - for storing YMME information
export const vehicles = pgTable("vehicles", {
  id: serial("id").primaryKey(),
  year: integer("year").notNull(),
  make: text("make").notNull(),
  model: text("model").notNull(),
  submodel: text("submodel"),
  engine: text("engine"),
  transmission: text("transmission"), // Manual, Automática, CVT, etc.
  trim: text("trim"), // Edición, paquete o nivel de acabado
  bodyType: text("body_type"), // Sedán, SUV, Pickup, etc.
  originCountry: text("origin_country"), // México, EEUU, Japón, etc.
  isImported: boolean("is_imported").default(false), // Para identificar vehículos importados
  availableInMexico: boolean("available_in_mexico").default(true), // Disponibilidad en el mercado mexicano
  mexicanName: text("mexican_name"), // Nombre específico en el mercado mexicano si difiere
  fuelType: text("fuel_type"), // Gasolina, Diésel, Híbrido, Eléctrico
  cylinderCount: integer("cylinder_count"), // Número de cilindros
  displacement: text("displacement"), // Cilindrada (ej. "2.0L")
  driveType: text("drive_type"), // FWD, RWD, AWD, 4WD
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertVehicleSchema = createInsertSchema(vehicles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Compatibility table - for mapping products to vehicles (ACES mapping)
export const compatibility = pgTable("compatibility", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull().references(() => products.id),
  vehicleId: integer("vehicle_id").notNull().references(() => vehicles.id),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCompatibilitySchema = createInsertSchema(compatibility).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Categories table for product categorization
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  parentId: integer("parent_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Brands table for product brands
export const brands = pgTable("brands", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertBrandSchema = createInsertSchema(brands).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Type definitions
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

export type InsertVehicle = z.infer<typeof insertVehicleSchema>;
export type Vehicle = typeof vehicles.$inferSelect;

export type InsertCompatibility = z.infer<typeof insertCompatibilitySchema>;
export type Compatibility = typeof compatibility.$inferSelect;

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;

export type InsertBrand = z.infer<typeof insertBrandSchema>;
export type Brand = typeof brands.$inferSelect;

// Diagnostic history table - for storing user diagnostic results
export const diagnostics = pgTable("diagnostics", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  vehicleId: integer("vehicle_id").references(() => vehicles.id),
  obdCodes: text("obd_codes").array(),
  symptoms: text("symptoms").array(),
  additionalInfo: text("additional_info"),
  diagnosis: text("diagnosis").notNull(),
  chatHistory: jsonb("chat_history").notNull(),
  severity: text("severity"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const insertDiagnosticSchema = createInsertSchema(diagnostics).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertDiagnostic = z.infer<typeof insertDiagnosticSchema>;
export type Diagnostic = typeof diagnostics.$inferSelect;

// Chat message schema for diagnostic history
export const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string()
});

export type ChatMessage = z.infer<typeof chatMessageSchema>;

// Extended schema for product details with compatibility
export const productDetailsSchema = z.object({
  product: z.object({
    id: z.number(),
    sku: z.string(),
    title: z.string(),
    description: z.string(),
    price: z.number(),
    brand: z.string(),
    category: z.string(),
    stock: z.number(),
    inStock: z.boolean(),
    images: z.array(z.string()),
  }),
  compatibleVehicles: z.array(
    z.object({
      id: z.number(),
      year: z.number(),
      make: z.string(),
      model: z.string(),
      submodel: z.string().optional(),
      engine: z.string().optional(),
      transmission: z.string().optional(),
      trim: z.string().optional(),
      bodyType: z.string().optional(),
      originCountry: z.string().optional(),
      isImported: z.boolean().optional(),
      availableInMexico: z.boolean().optional(),
      mexicanName: z.string().optional(),
      fuelType: z.string().optional(),
      cylinderCount: z.number().optional(),
      displacement: z.string().optional(),
      driveType: z.string().optional(),
    })
  ),
});

export type ProductDetails = z.infer<typeof productDetailsSchema>;

// Video tutorials table
export const videoTutorials = pgTable("video_tutorials", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  videoUrl: text("video_url").notNull(),
  thumbnailUrl: text("thumbnail_url").notNull(),
  duration: integer("duration").notNull(), // Duration in seconds
  difficultyLevel: text("difficulty_level").notNull().default("intermediate"), // beginner, intermediate, advanced
  category: text("category").notNull(),
  tags: text("tags").array().notNull().default([]),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertVideoTutorialSchema = createInsertSchema(videoTutorials).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Video compatibility table - for mapping videos to vehicles and/or products
export const videoCompatibility = pgTable("video_compatibility", {
  id: serial("id").primaryKey(),
  videoId: integer("video_id").notNull().references(() => videoTutorials.id),
  vehicleId: integer("vehicle_id").references(() => vehicles.id),
  productId: integer("product_id").references(() => products.id),
  relevanceScore: integer("relevance_score").default(5), // 1-10 score for recommendation priority
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertVideoCompatibilitySchema = createInsertSchema(videoCompatibility).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Type definitions for video tutorials
export type InsertVideoTutorial = z.infer<typeof insertVideoTutorialSchema>;
export type VideoTutorial = typeof videoTutorials.$inferSelect;

export type InsertVideoCompatibility = z.infer<typeof insertVideoCompatibilitySchema>;
export type VideoCompatibility = typeof videoCompatibility.$inferSelect;

// Schema for video details with compatibility information
export const videoDetailsSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  videoUrl: z.string(),
  thumbnailUrl: z.string(),
  duration: z.number(),
  difficultyLevel: z.string(),
  category: z.string(),
  tags: z.array(z.string()),
  relatedProducts: z.array(z.object({
    id: z.number(),
    title: z.string(),
    brand: z.string(),
    thumbnailUrl: z.string().optional(),
  })).optional(),
  compatibleVehicles: z.array(z.object({
    id: z.number(),
    year: z.number(),
    make: z.string(),
    model: z.string(),
    submodel: z.string().optional(),
    engine: z.string().optional(),
    transmission: z.string().optional(),
    trim: z.string().optional(),
    bodyType: z.string().optional(),
    originCountry: z.string().optional(),
    isImported: z.boolean().optional(),
    availableInMexico: z.boolean().optional(),
    mexicanName: z.string().optional(),
    fuelType: z.string().optional(),
    cylinderCount: z.number().optional(),
    displacement: z.string().optional(),
    driveType: z.string().optional(),
  })).optional(),
});

export type VideoDetails = z.infer<typeof videoDetailsSchema>;

// SmartCar Connected Vehicles table - for storing user connected vehicles via SmartCar
export const smartcarVehicles = pgTable("smartcar_vehicles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  vehicleId: text("vehicle_id").notNull(), // SmartCar vehicle ID
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  tokenExpiryDate: timestamp("token_expiry_date"),
  lastSyncDate: timestamp("last_sync_date"),
  make: text("make"),
  model: text("model"),
  year: integer("year"),
  vin: text("vin"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertSmartcarVehicleSchema = createInsertSchema(smartcarVehicles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertSmartcarVehicle = z.infer<typeof insertSmartcarVehicleSchema>;
export type SmartcarVehicle = typeof smartcarVehicles.$inferSelect;

// SmartCar Vehicle Data - for storing vehicle data snapshots from SmartCar
export const smartcarVehicleData = pgTable("smartcar_vehicle_data", {
  id: serial("id").primaryKey(),
  smartcarVehicleId: integer("smartcar_vehicle_id").notNull().references(() => smartcarVehicles.id),
  odometer: doublePrecision("odometer"),
  fuelPercentRemaining: doublePrecision("fuel_percent_remaining"),
  batteryPercentRemaining: doublePrecision("battery_percent_remaining"),
  oilLife: doublePrecision("oil_life"),
  tirePressure: jsonb("tire_pressure"), // JSON object with tire pressures
  engineStatus: text("engine_status"), // on, off
  location: jsonb("location"), // JSON object with lat/long
  batteryVoltage: doublePrecision("battery_voltage"),
  checkEngineLight: boolean("check_engine_light"),
  activeDtcs: text("active_dtcs").array(), // Array of active diagnostic trouble codes
  rawData: jsonb("raw_data"), // Full raw data from SmartCar
  recordedAt: timestamp("recorded_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertSmartcarVehicleDataSchema = createInsertSchema(smartcarVehicleData).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertSmartcarVehicleData = z.infer<typeof insertSmartcarVehicleDataSchema>;
export type SmartcarVehicleData = typeof smartcarVehicleData.$inferSelect;

// SmartCar Settings and Configuration
export const smartcarConfig = pgTable("smartcar_config", {
  id: serial("id").primaryKey(),
  clientId: text("client_id").notNull(),
  clientSecret: text("client_secret").notNull(),
  redirectUri: text("redirect_uri").notNull(),
  testMode: boolean("test_mode").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertSmartcarConfigSchema = createInsertSchema(smartcarConfig).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertSmartcarConfig = z.infer<typeof insertSmartcarConfigSchema>;
export type SmartcarConfig = typeof smartcarConfig.$inferSelect;

// Define relationships between tables
export const usersRelations = relations(users, ({ many }) => ({
  diagnostics: many(diagnostics),
  smartcarVehicles: many(smartcarVehicles),
}));

export const smartcarVehiclesRelations = relations(smartcarVehicles, ({ one, many }) => ({
  user: one(users, {
    fields: [smartcarVehicles.userId],
    references: [users.id],
  }),
  vehicleData: many(smartcarVehicleData),
}));

export const smartcarVehicleDataRelations = relations(smartcarVehicleData, ({ one }) => ({
  vehicle: one(smartcarVehicles, {
    fields: [smartcarVehicleData.smartcarVehicleId],
    references: [smartcarVehicles.id],
  }),
}));
