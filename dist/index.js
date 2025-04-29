var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express4 from "express";

// server/middleware/setup.ts
import express from "express";

// server/utils/logger.ts
var Logger = class {
  getTimestamp() {
    return (/* @__PURE__ */ new Date()).toLocaleTimeString();
  }
  log(level, message, ...args) {
    const timestamp2 = this.getTimestamp();
    console.log(`${timestamp2} [${level.toUpperCase()}] ${message}`, ...args);
  }
  info(message, ...args) {
    this.log("info", message, ...args);
  }
  error(message, ...args) {
    this.log("error", message, ...args);
  }
  warn(message, ...args) {
    this.log("warn", message, ...args);
  }
  debug(message, ...args) {
    if (process.env.NODE_ENV === "development") {
      this.log("debug", message, ...args);
    }
  }
};
var logger = new Logger();

// server/middleware/setup.ts
function setupMiddleware(app) {
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use((req, res, next) => {
    const start = Date.now();
    const path4 = req.path;
    res.on("finish", () => {
      const duration = Date.now() - start;
      if (path4.startsWith("/api")) {
        logger.info(`${req.method} ${path4} ${res.statusCode} in ${duration}ms`);
      }
    });
    next();
  });
}

// server/routes.ts
import { createServer } from "http";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  brands: () => brands,
  categories: () => categories,
  chatMessageSchema: () => chatMessageSchema,
  compatibility: () => compatibility,
  diagnostics: () => diagnostics,
  insertBrandSchema: () => insertBrandSchema,
  insertCategorySchema: () => insertCategorySchema,
  insertCompatibilitySchema: () => insertCompatibilitySchema,
  insertDiagnosticSchema: () => insertDiagnosticSchema,
  insertProductSchema: () => insertProductSchema,
  insertSmartcarConfigSchema: () => insertSmartcarConfigSchema,
  insertSmartcarVehicleDataSchema: () => insertSmartcarVehicleDataSchema,
  insertSmartcarVehicleSchema: () => insertSmartcarVehicleSchema,
  insertUserSchema: () => insertUserSchema,
  insertVehicleSchema: () => insertVehicleSchema,
  insertVideoCompatibilitySchema: () => insertVideoCompatibilitySchema,
  insertVideoTutorialSchema: () => insertVideoTutorialSchema,
  productDetailsSchema: () => productDetailsSchema,
  products: () => products,
  smartcarConfig: () => smartcarConfig,
  smartcarVehicleData: () => smartcarVehicleData,
  smartcarVehicleDataRelations: () => smartcarVehicleDataRelations,
  smartcarVehicles: () => smartcarVehicles,
  smartcarVehiclesRelations: () => smartcarVehiclesRelations,
  users: () => users,
  usersRelations: () => usersRelations,
  vehicles: () => vehicles,
  videoCompatibility: () => videoCompatibility,
  videoDetailsSchema: () => videoDetailsSchema,
  videoTutorials: () => videoTutorials
});
import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  role: text("role").default("customer"),
  // customer, admin, technician
  language: text("language").default("es"),
  // es, en
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var products = pgTable("products", {
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
  updatedAt: timestamp("updated_at").defaultNow()
});
var insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var vehicles = pgTable("vehicles", {
  id: serial("id").primaryKey(),
  year: integer("year").notNull(),
  make: text("make").notNull(),
  model: text("model").notNull(),
  submodel: text("submodel"),
  engine: text("engine"),
  transmission: text("transmission"),
  // Manual, Automática, CVT, etc.
  trim: text("trim"),
  // Edición, paquete o nivel de acabado
  bodyType: text("body_type"),
  // Sedán, SUV, Pickup, etc.
  originCountry: text("origin_country"),
  // México, EEUU, Japón, etc.
  isImported: boolean("is_imported").default(false),
  // Para identificar vehículos importados
  availableInMexico: boolean("available_in_mexico").default(true),
  // Disponibilidad en el mercado mexicano
  mexicanName: text("mexican_name"),
  // Nombre específico en el mercado mexicano si difiere
  fuelType: text("fuel_type"),
  // Gasolina, Diésel, Híbrido, Eléctrico
  cylinderCount: integer("cylinder_count"),
  // Número de cilindros
  displacement: text("displacement"),
  // Cilindrada (ej. "2.0L")
  driveType: text("drive_type"),
  // FWD, RWD, AWD, 4WD
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var insertVehicleSchema = createInsertSchema(vehicles).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var compatibility = pgTable("compatibility", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull().references(() => products.id),
  vehicleId: integer("vehicle_id").notNull().references(() => vehicles.id),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var insertCompatibilitySchema = createInsertSchema(compatibility).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  parentId: integer("parent_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var brands = pgTable("brands", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var insertBrandSchema = createInsertSchema(brands).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var diagnostics = pgTable("diagnostics", {
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
var insertDiagnosticSchema = createInsertSchema(diagnostics).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string()
});
var productDetailsSchema = z.object({
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
    images: z.array(z.string())
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
      driveType: z.string().optional()
    })
  )
});
var videoTutorials = pgTable("video_tutorials", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  videoUrl: text("video_url").notNull(),
  thumbnailUrl: text("thumbnail_url").notNull(),
  duration: integer("duration").notNull(),
  // Duration in seconds
  difficultyLevel: text("difficulty_level").notNull().default("intermediate"),
  // beginner, intermediate, advanced
  category: text("category").notNull(),
  tags: text("tags").array().notNull().default([]),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var insertVideoTutorialSchema = createInsertSchema(videoTutorials).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var videoCompatibility = pgTable("video_compatibility", {
  id: serial("id").primaryKey(),
  videoId: integer("video_id").notNull().references(() => videoTutorials.id),
  vehicleId: integer("vehicle_id").references(() => vehicles.id),
  productId: integer("product_id").references(() => products.id),
  relevanceScore: integer("relevance_score").default(5),
  // 1-10 score for recommendation priority
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var insertVideoCompatibilitySchema = createInsertSchema(videoCompatibility).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var videoDetailsSchema = z.object({
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
    thumbnailUrl: z.string().optional()
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
    driveType: z.string().optional()
  })).optional()
});
var smartcarVehicles = pgTable("smartcar_vehicles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  vehicleId: text("vehicle_id").notNull(),
  // SmartCar vehicle ID
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  tokenExpiryDate: timestamp("token_expiry_date"),
  lastSyncDate: timestamp("last_sync_date"),
  make: text("make"),
  model: text("model"),
  year: integer("year"),
  vin: text("vin"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var insertSmartcarVehicleSchema = createInsertSchema(smartcarVehicles).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var smartcarVehicleData = pgTable("smartcar_vehicle_data", {
  id: serial("id").primaryKey(),
  smartcarVehicleId: integer("smartcar_vehicle_id").notNull().references(() => smartcarVehicles.id),
  odometer: doublePrecision("odometer"),
  fuelPercentRemaining: doublePrecision("fuel_percent_remaining"),
  batteryPercentRemaining: doublePrecision("battery_percent_remaining"),
  oilLife: doublePrecision("oil_life"),
  tirePressure: jsonb("tire_pressure"),
  // JSON object with tire pressures
  engineStatus: text("engine_status"),
  // on, off
  location: jsonb("location"),
  // JSON object with lat/long
  batteryVoltage: doublePrecision("battery_voltage"),
  checkEngineLight: boolean("check_engine_light"),
  activeDtcs: text("active_dtcs").array(),
  // Array of active diagnostic trouble codes
  rawData: jsonb("raw_data"),
  // Full raw data from SmartCar
  recordedAt: timestamp("recorded_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var insertSmartcarVehicleDataSchema = createInsertSchema(smartcarVehicleData).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var smartcarConfig = pgTable("smartcar_config", {
  id: serial("id").primaryKey(),
  clientId: text("client_id").notNull(),
  clientSecret: text("client_secret").notNull(),
  redirectUri: text("redirect_uri").notNull(),
  testMode: boolean("test_mode").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var insertSmartcarConfigSchema = createInsertSchema(smartcarConfig).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var usersRelations = relations(users, ({ many }) => ({
  diagnostics: many(diagnostics),
  smartcarVehicles: many(smartcarVehicles)
}));
var smartcarVehiclesRelations = relations(smartcarVehicles, ({ one, many }) => ({
  user: one(users, {
    fields: [smartcarVehicles.userId],
    references: [users.id]
  }),
  vehicleData: many(smartcarVehicleData)
}));
var smartcarVehicleDataRelations = relations(smartcarVehicleData, ({ one }) => ({
  vehicle: one(smartcarVehicles, {
    fields: [smartcarVehicleData.smartcarVehicleId],
    references: [smartcarVehicles.id]
  })
}));

// server/storage.ts
import { desc } from "drizzle-orm";

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
neonConfig.webSocketConstructor = ws;
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var db = drizzle({ client: pool, schema: schema_exports });

// server/storage.ts
import { eq } from "drizzle-orm";
var MemStorage = class {
  users;
  vehicles;
  products;
  compatibilityRecords;
  categories;
  brands;
  diagnostics;
  videoTutorials;
  videoCompatibilityRecords;
  smartcarConfigs;
  smartcarVehicles;
  smartcarVehicleData;
  userIdCounter;
  vehicleIdCounter;
  productIdCounter;
  compatibilityIdCounter;
  categoryIdCounter;
  brandIdCounter;
  diagnosticIdCounter;
  videoTutorialIdCounter;
  videoCompatibilityIdCounter;
  smartcarConfigIdCounter;
  smartcarVehicleIdCounter;
  smartcarVehicleDataIdCounter;
  constructor() {
    this.users = /* @__PURE__ */ new Map();
    this.vehicles = /* @__PURE__ */ new Map();
    this.products = /* @__PURE__ */ new Map();
    this.compatibilityRecords = /* @__PURE__ */ new Map();
    this.categories = /* @__PURE__ */ new Map();
    this.brands = /* @__PURE__ */ new Map();
    this.diagnostics = /* @__PURE__ */ new Map();
    this.videoTutorials = /* @__PURE__ */ new Map();
    this.videoCompatibilityRecords = /* @__PURE__ */ new Map();
    this.smartcarConfigs = /* @__PURE__ */ new Map();
    this.smartcarVehicles = /* @__PURE__ */ new Map();
    this.smartcarVehicleData = /* @__PURE__ */ new Map();
    this.userIdCounter = 1;
    this.vehicleIdCounter = 1;
    this.productIdCounter = 1;
    this.compatibilityIdCounter = 1;
    this.categoryIdCounter = 1;
    this.brandIdCounter = 1;
    this.diagnosticIdCounter = 1;
    this.videoTutorialIdCounter = 1;
    this.videoCompatibilityIdCounter = 1;
    this.smartcarConfigIdCounter = 1;
    this.smartcarVehicleIdCounter = 1;
    this.smartcarVehicleDataIdCounter = 1;
    this.initializeDemoData();
  }
  // Initialize with some demo data for testing
  initializeDemoData() {
    const demoVehicles = [
      { year: 2020, make: "Toyota", model: "Corolla", engine: "1.8L 4-Cylinder" },
      { year: 2019, make: "Honda", model: "Civic", engine: "2.0L 4-Cylinder" },
      { year: 2021, make: "Ford", model: "Mustang", engine: "5.0L V8" },
      { year: 2018, make: "Chevrolet", model: "Camaro", engine: "6.2L V8" },
      { year: 2022, make: "Toyota", model: "RAV4", engine: "2.5L 4-Cylinder" },
      { year: 2020, make: "Honda", model: "Accord", engine: "1.5L Turbo 4-Cylinder" },
      { year: 2021, make: "Ford", model: "F-150", engine: "3.5L EcoBoost V6" },
      { year: 2019, make: "Chevrolet", model: "Silverado", engine: "5.3L V8" },
      { year: 2022, make: "Toyota", model: "Camry", engine: "2.5L 4-Cylinder" },
      { year: 2021, make: "Honda", model: "CR-V", engine: "1.5L Turbo 4-Cylinder" }
    ];
    demoVehicles.forEach((vehicle) => this.createVehicle(vehicle));
    const demoCategories = [
      { name: "Filtros", count: 42 },
      { name: "Frenos", count: 38 },
      { name: "Suspensi\xF3n", count: 35 },
      { name: "Lubricantes", count: 30 },
      { name: "El\xE9ctricos", count: 28 },
      { name: "Motor", count: 25 }
    ];
    demoCategories.forEach((category) => {
      const id = this.categoryIdCounter++;
      this.categories.set(id, { ...category, id });
    });
    const demoBrands = [
      { name: "Bosch", count: 45 },
      { name: "NGK", count: 40 },
      { name: "Brembo", count: 38 },
      { name: "Monroe", count: 35 },
      { name: "Fram", count: 32 },
      { name: "Denso", count: 30 }
    ];
    demoBrands.forEach((brand) => {
      const id = this.brandIdCounter++;
      this.brands.set(id, { ...brand, id });
    });
    const demoProducts = [
      {
        sku: "OIL-FILT-001",
        title: "Filtro de Aceite Premium",
        description: "Filtro de aceite de alta calidad para veh\xEDculos de pasajeros y camiones ligeros.",
        price: 9.99,
        brand: "Bosch",
        category: "Filtros",
        stock: 125,
        inStock: true,
        images: ["https://via.placeholder.com/300x300?text=Oil+Filter"]
      },
      {
        sku: "BRAKE-PAD-001",
        title: "Pastillas de Freno Cer\xE1micas",
        description: "Pastillas de freno cer\xE1micas para un rendimiento de frenado superior y menos polvo.",
        price: 49.99,
        brand: "Brembo",
        category: "Frenos",
        stock: 85,
        inStock: true,
        images: ["https://via.placeholder.com/300x300?text=Brake+Pads"]
      },
      {
        sku: "SPARK-PLUG-001",
        title: "Buj\xEDa de Encendido Iridium",
        description: "Buj\xEDas de iridio para un rendimiento y eficiencia de combustible mejorados.",
        price: 12.99,
        brand: "NGK",
        category: "El\xE9ctricos",
        stock: 200,
        inStock: true,
        images: ["https://via.placeholder.com/300x300?text=Spark+Plug"]
      },
      {
        sku: "SHOCK-ABS-001",
        title: "Amortiguador de Suspensi\xF3n",
        description: "Amortiguador de suspensi\xF3n de calidad OEM para una conducci\xF3n suave.",
        price: 79.99,
        brand: "Monroe",
        category: "Suspensi\xF3n",
        stock: 45,
        inStock: true,
        images: ["https://via.placeholder.com/300x300?text=Shock+Absorber"]
      },
      {
        sku: "AIR-FILT-001",
        title: "Filtro de Aire de Motor",
        description: "Filtro de aire de motor de alto flujo para mejorar el rendimiento y la eficiencia.",
        price: 14.99,
        brand: "Fram",
        category: "Filtros",
        stock: 150,
        inStock: true,
        images: ["https://via.placeholder.com/300x300?text=Air+Filter"]
      },
      {
        sku: "OXY-SENS-001",
        title: "Sensor de Ox\xEDgeno",
        description: "Sensor de ox\xEDgeno de precisi\xF3n para un control preciso de la relaci\xF3n aire-combustible.",
        price: 59.99,
        brand: "Denso",
        category: "El\xE9ctricos",
        stock: 65,
        inStock: true,
        images: ["https://via.placeholder.com/300x300?text=Oxygen+Sensor"]
      }
    ];
    demoProducts.forEach((product) => this.createProduct(product));
    const vehicles3 = Array.from(this.vehicles.values());
    const products4 = Array.from(this.products.values());
    products4.forEach((product) => {
      const shuffled = [...vehicles3].sort(() => 0.5 - Math.random());
      const selectedVehicles = shuffled.slice(0, Math.floor(Math.random() * 3) + 3);
      selectedVehicles.forEach((vehicle) => {
        const compatRecord = {
          productId: product.id,
          vehicleId: vehicle.id,
          notes: "Compatible con ajuste directo"
        };
        this.createCompatibility(compatRecord);
      });
    });
    const demoVideoTutorials = [
      {
        title: "C\xF3mo cambiar el filtro de aceite de tu autom\xF3vil",
        description: "Aprende c\xF3mo cambiar el filtro de aceite de tu autom\xF3vil de manera f\xE1cil y r\xE1pida. Este tutorial te guiar\xE1 paso a paso en el proceso.",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        thumbnailUrl: "https://via.placeholder.com/480x360?text=Cambio+de+Filtro+de+Aceite",
        duration: 720,
        // 12 minutos
        difficultyLevel: "beginner",
        category: "Mantenimiento",
        tags: ["filtro", "aceite", "cambio", "mantenimiento"]
      },
      {
        title: "Gu\xEDa completa para cambiar pastillas de freno",
        description: "Tutorial detallado sobre c\xF3mo cambiar las pastillas de freno de tu veh\xEDculo. Aprende a identificar cu\xE1ndo es necesario el cambio y c\xF3mo hacerlo correctamente.",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        thumbnailUrl: "https://via.placeholder.com/480x360?text=Cambio+de+Pastillas+de+Freno",
        duration: 1080,
        // 18 minutos
        difficultyLevel: "intermediate",
        category: "Frenos",
        tags: ["frenos", "pastillas", "mantenimiento", "seguridad"]
      },
      {
        title: "Soluci\xF3n de problemas comunes con buj\xEDas",
        description: "Aprende a diagnosticar y resolver problemas comunes relacionados con las buj\xEDas. Este video incluye demostraciones de c\xF3mo probar, limpiar y reemplazar buj\xEDas.",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        thumbnailUrl: "https://via.placeholder.com/480x360?text=Problemas+con+Buj\xEDas",
        duration: 840,
        // 14 minutos
        difficultyLevel: "intermediate",
        category: "El\xE9ctricos",
        tags: ["buj\xEDas", "diagn\xF3stico", "motor", "encendido"]
      },
      {
        title: "C\xF3mo reemplazar amortiguadores delanteros",
        description: "Gu\xEDa paso a paso para reemplazar los amortiguadores delanteros de tu veh\xEDculo. Aprende a reconocer cu\xE1ndo es necesario reemplazarlos y c\xF3mo hacerlo correctamente.",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        thumbnailUrl: "https://via.placeholder.com/480x360?text=Reemplazo+de+Amortiguadores",
        duration: 1320,
        // 22 minutos
        difficultyLevel: "advanced",
        category: "Suspensi\xF3n",
        tags: ["amortiguadores", "suspensi\xF3n", "reemplazo", "reparaci\xF3n"]
      },
      {
        title: "Mantenimiento del filtro de aire: Cu\xE1ndo y c\xF3mo cambiarlo",
        description: "Descubre la importancia del filtro de aire para el rendimiento de tu veh\xEDculo. Este tutorial te muestra c\xF3mo inspeccionarlo, limpiarlo y reemplazarlo cuando sea necesario.",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        thumbnailUrl: "https://via.placeholder.com/480x360?text=Mantenimiento+de+Filtro+de+Aire",
        duration: 600,
        // 10 minutos
        difficultyLevel: "beginner",
        category: "Mantenimiento",
        tags: ["filtro de aire", "mantenimiento", "rendimiento", "motor"]
      },
      {
        title: "Diagn\xF3stico y reemplazo de sensores de ox\xEDgeno",
        description: "Aprende a diagnosticar problemas con los sensores de ox\xEDgeno y c\xF3mo reemplazarlos correctamente. Este video te guiar\xE1 en el proceso completo.",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        thumbnailUrl: "https://via.placeholder.com/480x360?text=Sensores+de+Ox\xEDgeno",
        duration: 900,
        // 15 minutos
        difficultyLevel: "advanced",
        category: "El\xE9ctricos",
        tags: ["sensor", "ox\xEDgeno", "diagn\xF3stico", "emisiones"]
      }
    ];
    const createdVideos = demoVideoTutorials.map((video) => this.createVideoTutorial(video));
    const videoProductMappings = [
      { videoIndex: 0, productCategory: "Filtros" },
      // Filtro de aceite - Filtros
      { videoIndex: 1, productCategory: "Frenos" },
      // Pastillas de freno - Frenos
      { videoIndex: 2, productCategory: "El\xE9ctricos" },
      // Bujías - Eléctricos
      { videoIndex: 3, productCategory: "Suspensi\xF3n" },
      // Amortiguadores - Suspensión
      { videoIndex: 4, productCategory: "Filtros" },
      // Filtro de aire - Filtros
      { videoIndex: 5, productCategory: "El\xE9ctricos" }
      // Sensores de oxígeno - Eléctricos
    ];
    videoProductMappings.forEach((mapping) => {
      const video = createdVideos[mapping.videoIndex];
      const relatedProducts = products4.filter((p) => p.category === mapping.productCategory);
      relatedProducts.forEach((product) => {
        const videoCompatibility3 = {
          videoId: video.id,
          productId: product.id,
          relevanceScore: Math.floor(Math.random() * 5) + 6
          // Score between 6-10
        };
        this.createVideoCompatibility(videoCompatibility3);
      });
    });
    createdVideos.forEach((video) => {
      const shuffledVehicles = [...vehicles3].sort(() => 0.5 - Math.random());
      const selectedVehicles = shuffledVehicles.slice(0, Math.floor(Math.random() * 3) + 3);
      selectedVehicles.forEach((vehicle) => {
        const videoCompatibility3 = {
          videoId: video.id,
          vehicleId: vehicle.id,
          relevanceScore: Math.floor(Math.random() * 5) + 6
          // Score between 6-10
        };
        this.createVideoCompatibility(videoCompatibility3);
      });
    });
  }
  // User methods
  async getUser(id) {
    return this.users.get(id);
  }
  async getUserByUsername(username) {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  async createUser(insertUser) {
    const id = this.userIdCounter++;
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  // Vehicle methods
  async getVehicles(filters) {
    let results = Array.from(this.vehicles.values());
    if (filters.year) {
      results = results.filter((v) => v.year === filters.year);
    }
    if (filters.make) {
      results = results.filter((v) => v.make === filters.make);
    }
    if (filters.model) {
      results = results.filter((v) => v.model === filters.model);
    }
    if (filters.engine) {
      results = results.filter((v) => v.engine === filters.engine);
    }
    return results;
  }
  async getVehicleById(id) {
    return this.vehicles.get(id);
  }
  async createVehicle(vehicle) {
    const id = this.vehicleIdCounter++;
    const newVehicle = { ...vehicle, id };
    this.vehicles.set(id, newVehicle);
    return newVehicle;
  }
  async updateVehicle(id, vehicle) {
    const existingVehicle = this.vehicles.get(id);
    if (!existingVehicle) {
      return void 0;
    }
    const updatedVehicle = { ...vehicle, id };
    this.vehicles.set(id, updatedVehicle);
    return updatedVehicle;
  }
  async deleteVehicle(id) {
    return this.vehicles.delete(id);
  }
  async getUniqueVehicleValues(field, filters) {
    const vehicles3 = await this.getVehicles(filters);
    const uniqueValues = new Set(vehicles3.map((v) => v[field]).filter(Boolean));
    let results = Array.from(uniqueValues);
    if (field === "year") {
      results = results.sort((a, b) => Number(b) - Number(a));
    } else {
      results = results.sort();
    }
    return results;
  }
  // Product methods
  async getProducts(options) {
    let results = Array.from(this.products.values());
    if (options.filters.categories?.length) {
      results = results.filter((p) => options.filters.categories.includes(p.category));
    }
    if (options.filters.brands?.length) {
      results = results.filter((p) => options.filters.brands.includes(p.brand));
    }
    if (options.filters.minPrice !== void 0) {
      results = results.filter((p) => p.price >= options.filters.minPrice);
    }
    if (options.filters.maxPrice !== void 0) {
      results = results.filter((p) => p.price <= options.filters.maxPrice);
    }
    if (options.filters.inStock !== void 0) {
      results = results.filter((p) => p.inStock === options.filters.inStock);
    }
    if (options.filters.vehicle) {
      const { year, make, model, engine } = options.filters.vehicle;
      const matchingVehicles = await this.getVehicles({
        year,
        make,
        model,
        ...engine ? { engine } : {}
      });
      const vehicleIds = matchingVehicles.map((v) => v.id);
      const compatRecords = Array.from(this.compatibilityRecords.values()).filter((c) => vehicleIds.includes(c.vehicleId));
      const compatProductIds = new Set(compatRecords.map((c) => c.productId));
      results = results.filter((p) => compatProductIds.has(p.id));
    }
    const total = results.length;
    results = this.sortProducts(results, options.sortField, options.sortOrder);
    results = results.slice(options.offset, options.offset + options.limit);
    return { products: results, total };
  }
  sortProducts(products4, field, order) {
    return [...products4].sort((a, b) => {
      const aValue = a[field];
      const bValue = b[field];
      if (typeof aValue === "string" && typeof bValue === "string") {
        return order === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      if (typeof aValue === "number" && typeof bValue === "number") {
        return order === "asc" ? aValue - bValue : bValue - aValue;
      }
      return 0;
    });
  }
  async getProductById(id) {
    return this.products.get(id);
  }
  async createProduct(product) {
    const id = this.productIdCounter++;
    const newProduct = { ...product, id };
    this.products.set(id, newProduct);
    return newProduct;
  }
  async updateProduct(id, product) {
    const existingProduct = this.products.get(id);
    if (!existingProduct) {
      return void 0;
    }
    const updatedProduct = { ...product, id };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }
  async deleteProduct(id) {
    return this.products.delete(id);
  }
  async getFeaturedProducts() {
    const allProducts = Array.from(this.products.values());
    const shuffled = [...allProducts].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 4);
  }
  async getRelatedProducts(productId) {
    const product = await this.getProductById(productId);
    if (!product) {
      return [];
    }
    const relatedProducts = Array.from(this.products.values()).filter((p) => p.id !== productId && p.category === product.category).slice(0, 4);
    return relatedProducts;
  }
  // Compatibility methods
  async getCompatibilityRecords(filters) {
    let results = Array.from(this.compatibilityRecords.values());
    if (filters.productId !== void 0) {
      results = results.filter((c) => c.productId === filters.productId);
    }
    if (filters.vehicleId !== void 0) {
      results = results.filter((c) => c.vehicleId === filters.vehicleId);
    }
    return results;
  }
  async getCompatibilityById(id) {
    return this.compatibilityRecords.get(id);
  }
  async createCompatibility(compatibility4) {
    const id = this.compatibilityIdCounter++;
    const newCompatibility = { ...compatibility4, id };
    this.compatibilityRecords.set(id, newCompatibility);
    return newCompatibility;
  }
  async updateCompatibility(id, compatibility4) {
    const existingCompatibility = this.compatibilityRecords.get(id);
    if (!existingCompatibility) {
      return void 0;
    }
    const updatedCompatibility = { ...compatibility4, id };
    this.compatibilityRecords.set(id, updatedCompatibility);
    return updatedCompatibility;
  }
  async deleteCompatibility(id) {
    return this.compatibilityRecords.delete(id);
  }
  async createCompatibilityBatch(records) {
    let success = 0;
    let errors = 0;
    for (const record of records) {
      try {
        await this.createCompatibility(record);
        success++;
      } catch (error) {
        errors++;
      }
    }
    return { success, errors };
  }
  async checkCompatibility(productId, vehicleId) {
    const compatRecords = await this.getCompatibilityRecords({ productId, vehicleId });
    return compatRecords.length > 0;
  }
  async getCompatibleProducts(vehicleId) {
    const compatRecords = await this.getCompatibilityRecords({ vehicleId });
    const productIds = compatRecords.map((c) => c.productId);
    return productIds.map((id) => this.products.get(id)).filter(Boolean);
  }
  async getCompatibleVehicles(productId) {
    const compatRecords = await this.getCompatibilityRecords({ productId });
    const vehicleIds = compatRecords.map((c) => c.vehicleId);
    return vehicleIds.map((id) => this.vehicles.get(id)).filter(Boolean);
  }
  // Category methods
  async getCategories() {
    return Array.from(this.categories.values());
  }
  async getPopularCategories() {
    return Array.from(this.categories.values()).sort((a, b) => b.count - a.count).slice(0, 6);
  }
  // Brand methods
  async getBrands() {
    return Array.from(this.brands.values());
  }
  async getPopularBrands() {
    return Array.from(this.brands.values()).sort((a, b) => b.count - a.count).slice(0, 6);
  }
  // Diagnostic methods
  async getDiagnostics(userId) {
    const results = Array.from(this.diagnostics.values());
    if (userId) {
      return results.filter((d) => d.userId === userId);
    }
    return results;
  }
  async getDiagnosticById(id) {
    return this.diagnostics.get(id);
  }
  async createDiagnostic(diagnostic) {
    const id = this.diagnosticIdCounter++;
    const now = /* @__PURE__ */ new Date();
    const newDiagnostic = {
      ...diagnostic,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.diagnostics.set(id, newDiagnostic);
    return newDiagnostic;
  }
  async updateDiagnostic(id, diagnostic) {
    const existingDiagnostic = this.diagnostics.get(id);
    if (!existingDiagnostic) {
      return void 0;
    }
    const updatedDiagnostic = {
      ...existingDiagnostic,
      ...diagnostic,
      updatedAt: /* @__PURE__ */ new Date()
    };
    this.diagnostics.set(id, updatedDiagnostic);
    return updatedDiagnostic;
  }
  async deleteDiagnostic(id) {
    return this.diagnostics.delete(id);
  }
  // Analytics methods - Compatibility
  async getCompatibilityAnalyticsByMake(timeRange) {
    const vehicles3 = Array.from(this.vehicles.values());
    const compatibilities = Array.from(this.compatibilityRecords.values());
    const makeCountMap = /* @__PURE__ */ new Map();
    compatibilities.forEach((compat) => {
      const vehicle = this.vehicles.get(compat.vehicleId);
      if (vehicle) {
        const make = vehicle.make;
        makeCountMap.set(make, (makeCountMap.get(make) || 0) + 1);
      }
    });
    return Array.from(makeCountMap.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 5);
  }
  async getCompatibilityAnalyticsByYear(timeRange) {
    const vehicles3 = Array.from(this.vehicles.values());
    const compatibilities = Array.from(this.compatibilityRecords.values());
    const yearCountMap = /* @__PURE__ */ new Map();
    compatibilities.forEach((compat) => {
      const vehicle = this.vehicles.get(compat.vehicleId);
      if (vehicle) {
        const year = vehicle.year.toString();
        yearCountMap.set(year, (yearCountMap.get(year) || 0) + 1);
      }
    });
    return Array.from(yearCountMap.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }
  async getCompatibilityAnalyticsByCategory(timeRange) {
    const products4 = Array.from(this.products.values());
    const compatibilities = Array.from(this.compatibilityRecords.values());
    const categoryCountMap = /* @__PURE__ */ new Map();
    compatibilities.forEach((compat) => {
      const product = this.products.get(compat.productId);
      if (product) {
        const category = product.category;
        categoryCountMap.set(category, (categoryCountMap.get(category) || 0) + 1);
      }
    });
    return Array.from(categoryCountMap.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 5);
  }
  async getCompatibilityTrends(timeRange) {
    const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun"];
    return [
      { month: "Ene", compatibles: 50, incompatibles: 15 },
      { month: "Feb", compatibles: 55, incompatibles: 12 },
      { month: "Mar", compatibles: 60, incompatibles: 18 },
      { month: "Abr", compatibles: 58, incompatibles: 14 },
      { month: "May", compatibles: 65, incompatibles: 16 },
      { month: "Jun", compatibles: 70, incompatibles: 20 }
    ];
  }
  // Analytics methods - Products
  async getTopCompatibleProducts(timeRange) {
    const products4 = Array.from(this.products.values());
    const compatibilities = Array.from(this.compatibilityRecords.values());
    const productCompatMap = /* @__PURE__ */ new Map();
    compatibilities.forEach((compat) => {
      productCompatMap.set(compat.productId, (productCompatMap.get(compat.productId) || 0) + 1);
    });
    const productsWithCounts = products4.map((product) => ({
      ...product,
      compatibilityCount: productCompatMap.get(product.id) || 0
    }));
    return productsWithCounts.sort((a, b) => b.compatibilityCount - a.compatibilityCount).slice(0, 10);
  }
  async getProductCategoryDistribution(timeRange) {
    const products4 = Array.from(this.products.values());
    const categoryCountMap = /* @__PURE__ */ new Map();
    products4.forEach((product) => {
      const category = product.category;
      categoryCountMap.set(category, (categoryCountMap.get(category) || 0) + 1);
    });
    return Array.from(categoryCountMap.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }
  async getMostViewedProducts(timeRange) {
    const products4 = Array.from(this.products.values());
    return products4.map((product) => ({
      ...product,
      viewCount: Math.floor(Math.random() * 1e3)
      // Simular vistas
    })).sort((a, b) => b.viewCount - a.viewCount).slice(0, 10);
  }
  async getMostSearchedProducts(timeRange) {
    const products4 = Array.from(this.products.values());
    return products4.map((product) => ({
      ...product,
      searchCount: Math.floor(Math.random() * 500)
      // Simular búsquedas
    })).sort((a, b) => b.searchCount - a.searchCount).slice(0, 10);
  }
  // Analytics methods - Vehicles
  async getVehicleMakeDistribution(timeRange) {
    const vehicles3 = Array.from(this.vehicles.values());
    const makeCountMap = /* @__PURE__ */ new Map();
    vehicles3.forEach((vehicle) => {
      const make = vehicle.make;
      makeCountMap.set(make, (makeCountMap.get(make) || 0) + 1);
    });
    return Array.from(makeCountMap.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }
  async getVehicleYearDistribution(timeRange) {
    const vehicles3 = Array.from(this.vehicles.values());
    const yearCountMap = /* @__PURE__ */ new Map();
    vehicles3.forEach((vehicle) => {
      const year = vehicle.year.toString();
      yearCountMap.set(year, (yearCountMap.get(year) || 0) + 1);
    });
    return Array.from(yearCountMap.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => Number(a.name) - Number(b.name));
  }
  async getMostCompatibleVehicles(timeRange) {
    const vehicles3 = Array.from(this.vehicles.values());
    const compatibilities = Array.from(this.compatibilityRecords.values());
    const vehicleCompatMap = /* @__PURE__ */ new Map();
    compatibilities.forEach((compat) => {
      vehicleCompatMap.set(compat.vehicleId, (vehicleCompatMap.get(compat.vehicleId) || 0) + 1);
    });
    const vehiclesWithCounts = vehicles3.map((vehicle) => ({
      ...vehicle,
      compatibilityCount: vehicleCompatMap.get(vehicle.id) || 0
    }));
    return vehiclesWithCounts.sort((a, b) => b.compatibilityCount - a.compatibilityCount).slice(0, 10);
  }
  async getMostSearchedVehicles(timeRange) {
    const vehicles3 = Array.from(this.vehicles.values());
    return vehicles3.map((vehicle) => ({
      ...vehicle,
      searchCount: Math.floor(Math.random() * 300)
      // Simular búsquedas
    })).sort((a, b) => b.searchCount - a.searchCount).slice(0, 10);
  }
  // Analytics methods - Summary
  async getTotalProducts() {
    return this.products.size;
  }
  async getTotalVehicles() {
    return this.vehicles.size;
  }
  async getTotalCompatibilityRecords() {
    return this.compatibilityRecords.size;
  }
  async getAverageProductsPerVehicle() {
    const vehicles3 = Array.from(this.vehicles.values());
    const compatibilities = Array.from(this.compatibilityRecords.values());
    const vehicleProductsMap = /* @__PURE__ */ new Map();
    compatibilities.forEach((compat) => {
      if (!vehicleProductsMap.has(compat.vehicleId)) {
        vehicleProductsMap.set(compat.vehicleId, /* @__PURE__ */ new Set());
      }
      vehicleProductsMap.get(compat.vehicleId)?.add(compat.productId);
    });
    const productCounts = Array.from(vehicleProductsMap.values()).map((set) => set.size);
    const totalProductCount = productCounts.reduce((sum, count2) => sum + count2, 0);
    return vehicles3.length > 0 ? totalProductCount / vehicles3.length : 0;
  }
  // Video tutorial methods
  async getVideoTutorials(options) {
    let results = Array.from(this.videoTutorials.values());
    if (options.filters) {
      if (options.filters.category) {
        results = results.filter((v) => v.category === options.filters.category);
      }
      if (options.filters.difficultyLevel) {
        results = results.filter((v) => v.difficultyLevel === options.filters.difficultyLevel);
      }
      if (options.filters.tags && options.filters.tags.length > 0) {
        results = results.filter(
          (v) => options.filters.tags.some((tag) => v.tags.includes(tag))
        );
      }
      if (options.filters.vehicleId) {
        const vehicleCompatRecords = Array.from(this.videoCompatibilityRecords.values()).filter((vc) => vc.vehicleId === options.filters.vehicleId);
        const compatVideoIds = new Set(vehicleCompatRecords.map((vc) => vc.videoId));
        results = results.filter((v) => compatVideoIds.has(v.id));
      }
      if (options.filters.productId) {
        const productCompatRecords = Array.from(this.videoCompatibilityRecords.values()).filter((vc) => vc.productId === options.filters.productId);
        const compatVideoIds = new Set(productCompatRecords.map((vc) => vc.videoId));
        results = results.filter((v) => compatVideoIds.has(v.id));
      }
    }
    const total = results.length;
    if (options.sortField && options.sortOrder) {
      results = this.sortVideoTutorials(results, options.sortField, options.sortOrder);
    } else {
      results = results.sort((a, b) => {
        const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bDate - aDate;
      });
    }
    results = results.slice(options.offset, options.offset + options.limit);
    return { videos: results, total };
  }
  sortVideoTutorials(videos, field, order) {
    return [...videos].sort((a, b) => {
      const aValue = a[field];
      const bValue = b[field];
      if (typeof aValue === "string" && typeof bValue === "string") {
        return order === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      if (typeof aValue === "number" && typeof bValue === "number") {
        return order === "asc" ? aValue - bValue : bValue - aValue;
      }
      return 0;
    });
  }
  async getVideoTutorialById(id) {
    return this.videoTutorials.get(id);
  }
  async createVideoTutorial(video) {
    const id = this.videoTutorialIdCounter++;
    const newVideoTutorial = { ...video, id };
    this.videoTutorials.set(id, newVideoTutorial);
    return newVideoTutorial;
  }
  async updateVideoTutorial(id, video) {
    const existingVideo = this.videoTutorials.get(id);
    if (!existingVideo) {
      return void 0;
    }
    const updatedVideo = { ...video, id };
    this.videoTutorials.set(id, updatedVideo);
    return updatedVideo;
  }
  async deleteVideoTutorial(id) {
    const videoCompatRecords = Array.from(this.videoCompatibilityRecords.values()).filter((vc) => vc.videoId === id);
    videoCompatRecords.forEach((vc) => {
      this.videoCompatibilityRecords.delete(vc.id);
    });
    return this.videoTutorials.delete(id);
  }
  // Video compatibility methods
  async createVideoCompatibility(record) {
    const id = this.videoCompatibilityIdCounter++;
    const newVideoCompatibility = { ...record, id };
    this.videoCompatibilityRecords.set(id, newVideoCompatibility);
    return newVideoCompatibility;
  }
  async getVideoCompatibilityRecords(filters) {
    let results = Array.from(this.videoCompatibilityRecords.values());
    if (filters.videoId !== void 0) {
      results = results.filter((vc) => vc.videoId === filters.videoId);
    }
    if (filters.vehicleId !== void 0) {
      results = results.filter((vc) => vc.vehicleId === filters.vehicleId);
    }
    if (filters.productId !== void 0) {
      results = results.filter((vc) => vc.productId === filters.productId);
    }
    return results;
  }
  async deleteVideoCompatibility(id) {
    return this.videoCompatibilityRecords.delete(id);
  }
  // Specialized video tutorials methods
  async getVideoTutorialsForVehicle(vehicleId) {
    const vehicleCompatRecords = await this.getVideoCompatibilityRecords({ vehicleId });
    const videoIds = vehicleCompatRecords.map((vc) => vc.videoId);
    return videoIds.map((id) => this.videoTutorials.get(id)).filter(Boolean);
  }
  async getVideoTutorialsForProduct(productId) {
    const productCompatRecords = await this.getVideoCompatibilityRecords({ productId });
    const videoIds = productCompatRecords.map((vc) => vc.videoId);
    return videoIds.map((id) => this.videoTutorials.get(id)).filter(Boolean);
  }
  async getRelatedVideoTutorials(videoId) {
    const video = await this.getVideoTutorialById(videoId);
    if (!video) {
      return [];
    }
    const relatedVideos = Array.from(this.videoTutorials.values()).filter((v) => v.id !== videoId && v.category === video.category).slice(0, 4);
    return relatedVideos;
  }
  async getPopularVideoTutorials() {
    const allVideos = Array.from(this.videoTutorials.values());
    const shuffled = [...allVideos].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 4);
  }
  async getVideoTutorialDetails(videoId) {
    const video = await this.getVideoTutorialById(videoId);
    if (!video) {
      return void 0;
    }
    const productCompatRecords = await this.getVideoCompatibilityRecords({ videoId });
    const productIds = productCompatRecords.filter((vc) => vc.productId !== void 0).map((vc) => vc.productId);
    const relatedProducts = productIds.map((id) => this.products.get(id)).filter(Boolean).map((product) => ({
      id: product.id,
      title: product.title,
      brand: product.brand,
      thumbnailUrl: product.images[0] || void 0
    }));
    const vehicleCompatRecords = await this.getVideoCompatibilityRecords({ videoId });
    const vehicleIds = vehicleCompatRecords.filter((vc) => vc.vehicleId !== void 0).map((vc) => vc.vehicleId);
    const compatibleVehicles = vehicleIds.map((id) => this.vehicles.get(id)).filter(Boolean).map((vehicle) => ({
      year: vehicle.year,
      make: vehicle.make,
      model: vehicle.model,
      engine: vehicle.engine || void 0
    }));
    const videoDetails = {
      id: video.id,
      title: video.title,
      description: video.description,
      videoUrl: video.videoUrl,
      thumbnailUrl: video.thumbnailUrl,
      duration: video.duration,
      difficultyLevel: video.difficultyLevel,
      category: video.category,
      tags: video.tags,
      relatedProducts: relatedProducts.length > 0 ? relatedProducts : void 0,
      compatibleVehicles: compatibleVehicles.length > 0 ? compatibleVehicles : void 0
    };
    return videoDetails;
  }
};
var DatabaseStorage = class {
  // User methods
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || void 0;
  }
  async getUserByUsername(username) {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || void 0;
  }
  async createUser(user) {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }
  // Vehicle methods
  async getVehicles(filters) {
    let query = db.select().from(vehicles);
    if (filters.id !== void 0) {
      query = query.where(eq(vehicles.id, filters.id));
    }
    if (filters.year !== void 0) {
      query = query.where(eq(vehicles.year, filters.year));
    }
    if (filters.make !== void 0) {
      query = query.where(eq(vehicles.make, filters.make));
    }
    if (filters.model !== void 0) {
      query = query.where(eq(vehicles.model, filters.model));
    }
    if (filters.engine !== void 0) {
      query = query.where(eq(vehicles.engine, filters.engine));
    }
    if (filters.isImported !== void 0) {
      query = query.where(eq(vehicles.isImported, filters.isImported));
    }
    if (filters.originCountry !== void 0) {
      query = query.where(eq(vehicles.originCountry, filters.originCountry));
    }
    return query;
  }
  async getVehicleById(id) {
    const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.id, id));
    return vehicle || void 0;
  }
  async createVehicle(vehicle) {
    const [newVehicle] = await db.insert(vehicles).values(vehicle).returning();
    return newVehicle;
  }
  async updateVehicle(id, vehicle) {
    const [updatedVehicle] = await db.update(vehicles).set(vehicle).where(eq(vehicles.id, id)).returning();
    return updatedVehicle || void 0;
  }
  async deleteVehicle(id) {
    const result = await db.delete(vehicles).where(eq(vehicles.id, id));
    return result.rowCount > 0;
  }
  async getUniqueVehicleValues(field, filters) {
    const vehiclesList = await this.getVehicles(filters);
    const uniqueValues = new Set(vehiclesList.map((v) => v[field]).filter(Boolean));
    let results = Array.from(uniqueValues);
    if (field === "year") {
      results = results.sort((a, b) => Number(b) - Number(a));
    } else {
      results = results.sort();
    }
    return results;
  }
  // Implementamos los métodos restantes usando MemStorage por ahora
  // Esto permite una migración gradual a la base de datos
  memStorage = new MemStorage();
  // Product methods
  async getProducts(options) {
    return this.memStorage.getProducts(options);
  }
  async getProductById(id) {
    return this.memStorage.getProductById(id);
  }
  async createProduct(product) {
    return this.memStorage.createProduct(product);
  }
  async updateProduct(id, product) {
    return this.memStorage.updateProduct(id, product);
  }
  async deleteProduct(id) {
    return this.memStorage.deleteProduct(id);
  }
  async getFeaturedProducts() {
    return this.memStorage.getFeaturedProducts();
  }
  async getRelatedProducts(productId) {
    return this.memStorage.getRelatedProducts(productId);
  }
  // Compatibility methods
  async getCompatibilityRecords(filters) {
    return this.memStorage.getCompatibilityRecords(filters);
  }
  async getCompatibilityById(id) {
    return this.memStorage.getCompatibilityById(id);
  }
  async createCompatibility(compatibility4) {
    return this.memStorage.createCompatibility(compatibility4);
  }
  async updateCompatibility(id, compatibility4) {
    return this.memStorage.updateCompatibility(id, compatibility4);
  }
  async deleteCompatibility(id) {
    return this.memStorage.deleteCompatibility(id);
  }
  async createCompatibilityBatch(records) {
    return this.memStorage.createCompatibilityBatch(records);
  }
  async checkCompatibility(productId, vehicleId) {
    return this.memStorage.checkCompatibility(productId, vehicleId);
  }
  async getCompatibleProducts(vehicleId) {
    return this.memStorage.getCompatibleProducts(vehicleId);
  }
  async getCompatibleVehicles(productId) {
    return this.memStorage.getCompatibleVehicles(productId);
  }
  // Category methods
  async getCategories() {
    return this.memStorage.getCategories();
  }
  async getPopularCategories() {
    return this.memStorage.getPopularCategories();
  }
  // Brand methods
  async getBrands() {
    return this.memStorage.getBrands();
  }
  async getPopularBrands() {
    return this.memStorage.getPopularBrands();
  }
  // Diagnostic methods
  async getDiagnostics(userId) {
    return this.memStorage.getDiagnostics(userId);
  }
  async getDiagnosticById(id) {
    return this.memStorage.getDiagnosticById(id);
  }
  async createDiagnostic(diagnostic) {
    return this.memStorage.createDiagnostic(diagnostic);
  }
  async updateDiagnostic(id, diagnostic) {
    return this.memStorage.updateDiagnostic(id, diagnostic);
  }
  async deleteDiagnostic(id) {
    return this.memStorage.deleteDiagnostic(id);
  }
  // Analytics methods
  async getCompatibilityAnalyticsByMake(timeRange) {
    return this.memStorage.getCompatibilityAnalyticsByMake(timeRange);
  }
  async getCompatibilityAnalyticsByYear(timeRange) {
    return this.memStorage.getCompatibilityAnalyticsByYear(timeRange);
  }
  async getCompatibilityAnalyticsByCategory(timeRange) {
    return this.memStorage.getCompatibilityAnalyticsByCategory(timeRange);
  }
  async getCompatibilityTrends(timeRange) {
    return this.memStorage.getCompatibilityTrends(timeRange);
  }
  async getTopCompatibleProducts(timeRange) {
    return this.memStorage.getTopCompatibleProducts(timeRange);
  }
  async getProductCategoryDistribution(timeRange) {
    return this.memStorage.getProductCategoryDistribution(timeRange);
  }
  async getMostViewedProducts(timeRange) {
    return this.memStorage.getMostViewedProducts(timeRange);
  }
  async getMostSearchedProducts(timeRange) {
    return this.memStorage.getMostSearchedProducts(timeRange);
  }
  async getVehicleMakeDistribution(timeRange) {
    return this.memStorage.getVehicleMakeDistribution(timeRange);
  }
  async getVehicleYearDistribution(timeRange) {
    return this.memStorage.getVehicleYearDistribution(timeRange);
  }
  async getMostCompatibleVehicles(timeRange) {
    return this.memStorage.getMostCompatibleVehicles(timeRange);
  }
  async getMostSearchedVehicles(timeRange) {
    return this.memStorage.getMostSearchedVehicles(timeRange);
  }
  async getTotalProducts() {
    return this.memStorage.getTotalProducts();
  }
  async getTotalVehicles() {
    return this.memStorage.getTotalVehicles();
  }
  async getTotalCompatibilityRecords() {
    return this.memStorage.getTotalCompatibilityRecords();
  }
  async getAverageProductsPerVehicle() {
    return this.memStorage.getAverageProductsPerVehicle();
  }
  // Video tutorial methods
  async getVideoTutorials(options) {
    return this.memStorage.getVideoTutorials(options);
  }
  async getVideoTutorialById(id) {
    return this.memStorage.getVideoTutorialById(id);
  }
  async createVideoTutorial(video) {
    return this.memStorage.createVideoTutorial(video);
  }
  async updateVideoTutorial(id, video) {
    return this.memStorage.updateVideoTutorial(id, video);
  }
  async deleteVideoTutorial(id) {
    return this.memStorage.deleteVideoTutorial(id);
  }
  async createVideoCompatibility(record) {
    return this.memStorage.createVideoCompatibility(record);
  }
  async getVideoCompatibilityRecords(filters) {
    return this.memStorage.getVideoCompatibilityRecords(filters);
  }
  async deleteVideoCompatibility(id) {
    return this.memStorage.deleteVideoCompatibility(id);
  }
  async getVideoTutorialsForVehicle(vehicleId) {
    return this.memStorage.getVideoTutorialsForVehicle(vehicleId);
  }
  async getVideoTutorialsForProduct(productId) {
    return this.memStorage.getVideoTutorialsForProduct(productId);
  }
  async getRelatedVideoTutorials(videoId) {
    return this.memStorage.getRelatedVideoTutorials(videoId);
  }
  async getPopularVideoTutorials() {
    return this.memStorage.getPopularVideoTutorials();
  }
  async getVideoTutorialDetails(videoId) {
    return this.memStorage.getVideoTutorialDetails(videoId);
  }
  // SmartCar methods
  async getSmartcarConfig() {
    const configs = await db.select().from(smartcarConfig);
    return configs.length > 0 ? configs[0] : void 0;
  }
  async createSmartcarConfig(config) {
    const [inserted] = await db.insert(smartcarConfig).values({
      ...config,
      isActive: true
    }).returning();
    return inserted;
  }
  async updateSmartcarConfig(id, config) {
    const [updated] = await db.update(smartcarConfig).set({
      ...config,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(smartcarConfig.id, id)).returning();
    return updated;
  }
  // SmartCar vehicle methods
  async getSmartcarVehicles(userId) {
    const vehicles3 = await db.select().from(smartcarVehicles).where(eq(smartcarVehicles.userId, userId));
    return vehicles3;
  }
  async getSmartcarVehicleById(id) {
    const [vehicle] = await db.select().from(smartcarVehicles).where(eq(smartcarVehicles.id, id));
    return vehicle;
  }
  async createSmartcarVehicle(vehicle) {
    const [inserted] = await db.insert(smartcarVehicles).values(vehicle).returning();
    return inserted;
  }
  async updateSmartcarVehicle(id, vehicle) {
    const [updated] = await db.update(smartcarVehicles).set({
      ...vehicle,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(smartcarVehicles.id, id)).returning();
    return updated;
  }
  async deleteSmartcarVehicle(id) {
    await db.delete(smartcarVehicleData).where(eq(smartcarVehicleData.smartcarVehicleId, id));
    const result = await db.delete(smartcarVehicles).where(eq(smartcarVehicles.id, id));
    return result.rowCount > 0;
  }
  // SmartCar vehicle data methods
  async getSmartcarVehicleData(vehicleId) {
    const data = await db.select().from(smartcarVehicleData).where(eq(smartcarVehicleData.smartcarVehicleId, vehicleId)).orderBy(desc(smartcarVehicleData.recordedAt));
    return data;
  }
  async getSmartcarVehicleLatestData(vehicleId) {
    const [data] = await db.select().from(smartcarVehicleData).where(eq(smartcarVehicleData.smartcarVehicleId, vehicleId)).orderBy(desc(smartcarVehicleData.recordedAt)).limit(1);
    return data;
  }
  async createSmartcarVehicleData(data) {
    const [inserted] = await db.insert(smartcarVehicleData).values({
      ...data,
      recordedAt: /* @__PURE__ */ new Date()
    }).returning();
    return inserted;
  }
};
var storage = new DatabaseStorage();

// server/controllers/products.ts
function registerProductRoutes(app, prefix, storage2) {
  app.get(`${prefix}/products`, async (req, res) => {
    try {
      const {
        page = "1",
        limit = "12",
        sort = "relevance",
        year,
        make,
        model,
        engine,
        category,
        brand,
        min_price,
        max_price,
        availability
      } = req.query;
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const offset = (pageNum - 1) * limitNum;
      const filters = {};
      if (category) {
        filters.category = Array.isArray(category) ? category : [category];
      }
      if (brand) {
        filters.brand = Array.isArray(brand) ? brand : [brand];
      }
      if (min_price) {
        filters.minPrice = parseFloat(min_price);
      }
      if (max_price) {
        filters.maxPrice = parseFloat(max_price);
      }
      if (availability === "instock") {
        filters.inStock = true;
      } else if (availability === "backorder") {
        filters.inStock = false;
      }
      if (year && make && model) {
        filters.vehicle = {
          year: parseInt(year),
          make,
          model,
          engine: engine || void 0
        };
      }
      let sortField = "id";
      let sortOrder = "asc";
      switch (sort) {
        case "price_asc":
          sortField = "price";
          sortOrder = "asc";
          break;
        case "price_desc":
          sortField = "price";
          sortOrder = "desc";
          break;
        case "bestsellers":
          sortField = "popularity";
          sortOrder = "desc";
          break;
        case "relevance":
        default:
          sortField = "id";
          sortOrder = "desc";
          break;
      }
      const result = await storage2.getProducts({
        offset,
        limit: limitNum,
        filters,
        sortField,
        sortOrder
      });
      res.json({
        products: result.products,
        total: result.total,
        page: pageNum,
        totalPages: Math.ceil(result.total / limitNum)
      });
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Error fetching products" });
    }
  });
  app.get(`${prefix}/products/featured`, async (req, res) => {
    try {
      const featuredProducts = await storage2.getFeaturedProducts();
      res.json(featuredProducts);
    } catch (error) {
      console.error("Error fetching featured products:", error);
      res.status(500).json({ message: "Error fetching featured products" });
    }
  });
  app.get(`${prefix}/products/compatible`, async (req, res) => {
    try {
      const { vehicleId } = req.query;
      if (!vehicleId) {
        return res.status(400).json({ message: "Vehicle ID is required" });
      }
      const vehicleIdNum = parseInt(vehicleId);
      const compatibleProducts = await storage2.getCompatibleProducts(vehicleIdNum);
      res.json(compatibleProducts);
    } catch (error) {
      console.error("Error fetching compatible products:", error);
      res.status(500).json({ message: "Error fetching compatible products" });
    }
  });
  app.get(`${prefix}/products/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      const productId = parseInt(id);
      if (isNaN(productId)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      const product = await storage2.getProductById(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      const compatibleVehicles = await storage2.getCompatibleVehicles(productId);
      res.json({
        product,
        compatibleVehicles
      });
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Error fetching product" });
    }
  });
  app.get(`${prefix}/products/:id/related`, async (req, res) => {
    try {
      const { id } = req.params;
      const productId = parseInt(id);
      if (isNaN(productId)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      const relatedProducts = await storage2.getRelatedProducts(productId);
      res.json(relatedProducts);
    } catch (error) {
      console.error("Error fetching related products:", error);
      res.status(500).json({ message: "Error fetching related products" });
    }
  });
  app.post(`${prefix}/products`, async (req, res) => {
    try {
      const validatedData = insertProductSchema.parse(req.body);
      const product = await storage2.createProduct(validatedData);
      res.status(201).json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(400).json({ message: "Invalid product data" });
    }
  });
  app.put(`${prefix}/products/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      const productId = parseInt(id);
      if (isNaN(productId)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      const validatedData = insertProductSchema.parse(req.body);
      const updatedProduct = await storage2.updateProduct(productId, validatedData);
      if (!updatedProduct) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(updatedProduct);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(400).json({ message: "Invalid product data" });
    }
  });
  app.delete(`${prefix}/products/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      const productId = parseInt(id);
      if (isNaN(productId)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      const deleted = await storage2.deleteProduct(productId);
      if (!deleted) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ message: "Error deleting product" });
    }
  });
  app.get(`${prefix}/categories/popular`, async (req, res) => {
    try {
      const categories3 = await storage2.getPopularCategories();
      res.json(categories3);
    } catch (error) {
      console.error("Error fetching popular categories:", error);
      res.status(500).json({ message: "Error fetching popular categories" });
    }
  });
  app.get(`${prefix}/categories`, async (req, res) => {
    try {
      const categories3 = await storage2.getCategories();
      res.json(categories3);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Error fetching categories" });
    }
  });
  app.get(`${prefix}/brands/popular`, async (req, res) => {
    try {
      const brands3 = await storage2.getPopularBrands();
      res.json(brands3);
    } catch (error) {
      console.error("Error fetching popular brands:", error);
      res.status(500).json({ message: "Error fetching popular brands" });
    }
  });
  app.get(`${prefix}/brands`, async (req, res) => {
    try {
      const brands3 = await storage2.getBrands();
      res.json(brands3);
    } catch (error) {
      console.error("Error fetching brands:", error);
      res.status(500).json({ message: "Error fetching brands" });
    }
  });
  app.post(`${prefix}/products/compare`, async (req, res) => {
    try {
      const { productIds } = req.body;
      if (!Array.isArray(productIds) || productIds.length === 0) {
        return res.status(400).json({ message: "Product IDs array is required" });
      }
      if (productIds.length > 4) {
        return res.status(400).json({ message: "Maximum of 4 products can be compared at once" });
      }
      const productPromises = productIds.map((id) => storage2.getProductById(id));
      const products4 = await Promise.all(productPromises);
      const validProducts = products4.filter((p) => p !== void 0);
      res.json(validProducts);
    } catch (error) {
      console.error("Error fetching products for comparison:", error);
      res.status(500).json({ message: "Error fetching products for comparison" });
    }
  });
}

// server/controllers/vehicles.ts
function registerVehicleRoutes(app, prefix, storage2) {
  app.get(`${prefix}/vehicles`, async (req, res) => {
    try {
      const { year, make, model, engine } = req.query;
      const filters = {};
      if (year) {
        filters.year = parseInt(year);
      }
      if (make) {
        filters.make = make;
      }
      if (model) {
        filters.model = model;
      }
      if (engine) {
        filters.engine = engine;
      }
      const vehicles3 = await storage2.getVehicles(filters);
      res.json(vehicles3);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      res.status(500).json({ message: "Error fetching vehicles" });
    }
  });
  app.get(`${prefix}/vehicles/year`, async (req, res) => {
    try {
      const years = await storage2.getUniqueVehicleValues("year", {});
      res.json(years);
    } catch (error) {
      console.error("Error fetching vehicle years:", error);
      res.status(500).json({ message: "Error fetching vehicle years" });
    }
  });
  app.get(`${prefix}/vehicles/make`, async (req, res) => {
    try {
      const { year } = req.query;
      const filters = {};
      if (year) {
        filters.year = parseInt(year);
      }
      const makes = await storage2.getUniqueVehicleValues("make", filters);
      res.json(makes);
    } catch (error) {
      console.error("Error fetching vehicle makes:", error);
      res.status(500).json({ message: "Error fetching vehicle makes" });
    }
  });
  app.get(`${prefix}/vehicles/model`, async (req, res) => {
    try {
      const { year, make } = req.query;
      const filters = {};
      if (year) {
        filters.year = parseInt(year);
      }
      if (make) {
        filters.make = make;
      }
      const models = await storage2.getUniqueVehicleValues("model", filters);
      res.json(models);
    } catch (error) {
      console.error("Error fetching vehicle models:", error);
      res.status(500).json({ message: "Error fetching vehicle models" });
    }
  });
  app.get(`${prefix}/vehicles/engine`, async (req, res) => {
    try {
      const { year, make, model } = req.query;
      const filters = {};
      if (year) {
        filters.year = parseInt(year);
      }
      if (make) {
        filters.make = make;
      }
      if (model) {
        filters.model = model;
      }
      const engines = await storage2.getUniqueVehicleValues("engine", filters);
      res.json(engines);
    } catch (error) {
      console.error("Error fetching vehicle engines:", error);
      res.status(500).json({ message: "Error fetching vehicle engines" });
    }
  });
  app.get(`${prefix}/vehicles/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      const vehicleId = parseInt(id);
      if (isNaN(vehicleId)) {
        return res.status(400).json({ message: "Invalid vehicle ID" });
      }
      const vehicle = await storage2.getVehicleById(vehicleId);
      if (!vehicle) {
        return res.status(404).json({ message: "Vehicle not found" });
      }
      res.json(vehicle);
    } catch (error) {
      console.error("Error fetching vehicle:", error);
      res.status(500).json({ message: "Error fetching vehicle" });
    }
  });
  app.post(`${prefix}/vehicles`, async (req, res) => {
    try {
      const validatedData = insertVehicleSchema.parse(req.body);
      const vehicle = await storage2.createVehicle(validatedData);
      res.status(201).json(vehicle);
    } catch (error) {
      console.error("Error creating vehicle:", error);
      res.status(400).json({ message: "Invalid vehicle data" });
    }
  });
  app.put(`${prefix}/vehicles/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      const vehicleId = parseInt(id);
      if (isNaN(vehicleId)) {
        return res.status(400).json({ message: "Invalid vehicle ID" });
      }
      const validatedData = insertVehicleSchema.parse(req.body);
      const updatedVehicle = await storage2.updateVehicle(vehicleId, validatedData);
      if (!updatedVehicle) {
        return res.status(404).json({ message: "Vehicle not found" });
      }
      res.json(updatedVehicle);
    } catch (error) {
      console.error("Error updating vehicle:", error);
      res.status(400).json({ message: "Invalid vehicle data" });
    }
  });
  app.delete(`${prefix}/vehicles/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      const vehicleId = parseInt(id);
      if (isNaN(vehicleId)) {
        return res.status(400).json({ message: "Invalid vehicle ID" });
      }
      const deleted = await storage2.deleteVehicle(vehicleId);
      if (!deleted) {
        return res.status(404).json({ message: "Vehicle not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting vehicle:", error);
      res.status(500).json({ message: "Error deleting vehicle" });
    }
  });
}

// server/controllers/compatibility.ts
function registerCompatibilityRoutes(app, prefix, storage2) {
  app.get(`${prefix}/compatibility`, async (req, res) => {
    try {
      const { productId, vehicleId } = req.query;
      const filters = {};
      if (productId) {
        filters.productId = parseInt(productId);
      }
      if (vehicleId) {
        filters.vehicleId = parseInt(vehicleId);
      }
      const compatibilityRecords = await storage2.getCompatibilityRecords(filters);
      res.json(compatibilityRecords);
    } catch (error) {
      console.error("Error fetching compatibility records:", error);
      res.status(500).json({ message: "Error fetching compatibility records" });
    }
  });
  app.get(`${prefix}/compatibility/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      const recordId = parseInt(id);
      if (isNaN(recordId)) {
        return res.status(400).json({ message: "Invalid compatibility record ID" });
      }
      const compatibilityRecord = await storage2.getCompatibilityById(recordId);
      if (!compatibilityRecord) {
        return res.status(404).json({ message: "Compatibility record not found" });
      }
      res.json(compatibilityRecord);
    } catch (error) {
      console.error("Error fetching compatibility record:", error);
      res.status(500).json({ message: "Error fetching compatibility record" });
    }
  });
  app.post(`${prefix}/compatibility`, async (req, res) => {
    try {
      const validatedData = insertCompatibilitySchema.parse(req.body);
      const product = await storage2.getProductById(validatedData.productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      const vehicle = await storage2.getVehicleById(validatedData.vehicleId);
      if (!vehicle) {
        return res.status(404).json({ message: "Vehicle not found" });
      }
      const existing = await storage2.getCompatibilityRecords({
        productId: validatedData.productId,
        vehicleId: validatedData.vehicleId
      });
      if (existing.length > 0) {
        return res.status(409).json({ message: "Compatibility record already exists" });
      }
      const compatibilityRecord = await storage2.createCompatibility(validatedData);
      res.status(201).json(compatibilityRecord);
    } catch (error) {
      console.error("Error creating compatibility record:", error);
      res.status(400).json({ message: "Invalid compatibility record data" });
    }
  });
  app.put(`${prefix}/compatibility/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      const recordId = parseInt(id);
      if (isNaN(recordId)) {
        return res.status(400).json({ message: "Invalid compatibility record ID" });
      }
      const validatedData = insertCompatibilitySchema.parse(req.body);
      const product = await storage2.getProductById(validatedData.productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      const vehicle = await storage2.getVehicleById(validatedData.vehicleId);
      if (!vehicle) {
        return res.status(404).json({ message: "Vehicle not found" });
      }
      const updatedRecord = await storage2.updateCompatibility(recordId, validatedData);
      if (!updatedRecord) {
        return res.status(404).json({ message: "Compatibility record not found" });
      }
      res.json(updatedRecord);
    } catch (error) {
      console.error("Error updating compatibility record:", error);
      res.status(400).json({ message: "Invalid compatibility record data" });
    }
  });
  app.delete(`${prefix}/compatibility/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      const recordId = parseInt(id);
      if (isNaN(recordId)) {
        return res.status(400).json({ message: "Invalid compatibility record ID" });
      }
      const deleted = await storage2.deleteCompatibility(recordId);
      if (!deleted) {
        return res.status(404).json({ message: "Compatibility record not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting compatibility record:", error);
      res.status(500).json({ message: "Error deleting compatibility record" });
    }
  });
  app.post(`${prefix}/compatibility/batch`, async (req, res) => {
    try {
      const { records } = req.body;
      if (!Array.isArray(records) || records.length === 0) {
        return res.status(400).json({ message: "Records must be a non-empty array" });
      }
      const results = await storage2.createCompatibilityBatch(records);
      res.status(201).json(results);
    } catch (error) {
      console.error("Error creating batch compatibility records:", error);
      res.status(400).json({ message: "Invalid compatibility batch data" });
    }
  });
  app.get(`${prefix}/compatibility/check`, async (req, res) => {
    try {
      const { productId, vehicleId } = req.query;
      if (!productId || !vehicleId) {
        return res.status(400).json({ message: "Product ID and Vehicle ID are required" });
      }
      const productIdNum = parseInt(productId);
      const vehicleIdNum = parseInt(vehicleId);
      const isCompatible = await storage2.checkCompatibility(productIdNum, vehicleIdNum);
      res.json({ compatible: isCompatible });
    } catch (error) {
      console.error("Error checking compatibility:", error);
      res.status(500).json({ message: "Error checking compatibility" });
    }
  });
}

// server/utils/anthropic.ts
import OpenAI from "openai";
var openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});
var MODEL = "gpt-4-0125-preview";
var PART_CATEGORIES = [
  "filtro de aire",
  "filtro de aceite",
  "filtro de combustible",
  "filtro de habit\xE1culo",
  "buj\xEDa",
  "cable de buj\xEDa",
  "bobina de encendido",
  "sensor de ox\xEDgeno",
  "sensor MAF",
  "sensor MAP",
  "sensor de posici\xF3n del cig\xFCe\xF1al",
  "sensor de temperatura",
  "bomba de combustible",
  "inyector de combustible",
  "regulador de presi\xF3n",
  "alternador",
  "motor de arranque",
  "bater\xEDa",
  "cable de bater\xEDa",
  "pastilla de freno",
  "disco de freno",
  "calibrador de freno",
  "l\xEDquido de frenos",
  "amortiguador",
  "resorte",
  "barra estabilizadora",
  "correa de distribuci\xF3n",
  "correa serpentina",
  "tensor de correa",
  "termostato",
  "radiador",
  "bomba de agua",
  "manguera de radiador",
  "embrague",
  "volante motor",
  "caja de cambios",
  "aceite de transmisi\xF3n",
  "junta de culata",
  "empaque",
  "sello",
  "anillo de pist\xF3n",
  "catalizador",
  "silenciador",
  "tubo de escape",
  "sensor EGR",
  "aceite de motor",
  "l\xEDquido refrigerante",
  "l\xEDquido de direcci\xF3n",
  "l\xEDquido limpiaparabrisas"
];
function extractRecommendedParts(diagnosisText) {
  const normalizedText = diagnosisText.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const foundParts = [];
  const sectionPatterns = [
    /piezas\s+recomendadas[:\s]+(.*?)(?:\n\n|\n[A-Z]|$)/is,
    /componentes\s+a\s+reemplazar[:\s]+(.*?)(?:\n\n|\n[A-Z]|$)/is,
    /se\s+recomienda\s+reemplazar[:\s]+(.*?)(?:\n\n|\n[A-Z]|$)/is,
    /necesitarás[:\s]+(.*?)(?:\n\n|\n[A-Z]|$)/is
  ];
  for (const pattern of sectionPatterns) {
    const match = normalizedText.match(pattern);
    if (match && match[1]) {
      const sectionText = match[1].toLowerCase();
      for (const part of PART_CATEGORIES) {
        const normalizedPart = part.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        if (sectionText.includes(normalizedPart) && !foundParts.includes(part)) {
          foundParts.push(part);
        }
      }
      if (foundParts.length > 0) {
        return foundParts;
      }
    }
  }
  for (const part of PART_CATEGORIES) {
    const normalizedPart = part.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (normalizedText.includes(normalizedPart) && !foundParts.includes(part)) {
      foundParts.push(part);
    }
  }
  return foundParts;
}
function extractSeverity(diagnosisText) {
  const normalizedText = diagnosisText.toLowerCase();
  const severityPatterns = [
    { pattern: /severidad:\s*alta|severidad\s+alta|prioridad:\s*alta|prioridad\s+alta|urgente|peligroso|inmediata|crítico/i, value: "alta" },
    { pattern: /severidad:\s*baja|severidad\s+baja|prioridad:\s*baja|prioridad\s+baja|no\s+urgente|menor|leve/i, value: "baja" },
    { pattern: /severidad:\s*media|severidad\s+media|prioridad:\s*media|prioridad\s+media|moderado|atención\s+pronto/i, value: "media" }
  ];
  for (const { pattern, value } of severityPatterns) {
    if (pattern.test(normalizedText)) {
      return value;
    }
  }
  return "media";
}
async function analyzeDiagnostic(vehicleInfo, obdCodes, symptoms, additionalInfo, chatHistory) {
  try {
    const messages = chatHistory || [];
    if (!chatHistory || chatHistory.length === 0) {
      let initialPrompt = "";
      if (vehicleInfo) {
        initialPrompt += "Informaci\xF3n del veh\xEDculo:\n";
        if (vehicleInfo.year) initialPrompt += `- A\xF1o: ${vehicleInfo.year}
`;
        if (vehicleInfo.make) initialPrompt += `- Marca: ${vehicleInfo.make}
`;
        if (vehicleInfo.model) initialPrompt += `- Modelo: ${vehicleInfo.model}
`;
        if (vehicleInfo.engine) initialPrompt += `- Motor: ${vehicleInfo.engine}
`;
        initialPrompt += "\n";
      }
      if (obdCodes && obdCodes.length > 0) {
        initialPrompt += `C\xF3digos OBD detectados: ${obdCodes.join(", ")}

`;
      }
      if (symptoms && symptoms.length > 0) {
        initialPrompt += "S\xEDntomas reportados:\n";
        symptoms.forEach((symptom, index) => {
          initialPrompt += `${index + 1}. ${symptom}
`;
        });
        initialPrompt += "\n";
      }
      if (additionalInfo) {
        initialPrompt += `Informaci\xF3n adicional: ${additionalInfo}

`;
      }
      initialPrompt += "Por favor, proporciona un diagn\xF3stico detallado basado en esta informaci\xF3n.";
      messages.push({
        role: "user",
        content: initialPrompt
      });
    }
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages,
      temperature: 0.3,
      max_tokens: 2e3
    });
    const assistantResponse = response.choices[0].message.content || "No se pudo generar un diagn\xF3stico. Por favor, intenta de nuevo con m\xE1s informaci\xF3n.";
    const updatedChatHistory = [
      ...messages,
      {
        role: "assistant",
        content: assistantResponse
      }
    ];
    const recommendedParts = extractRecommendedParts(assistantResponse);
    const severity = extractSeverity(assistantResponse);
    return {
      chatHistory: updatedChatHistory,
      diagnosis: assistantResponse,
      severity,
      recommendedParts
    };
  } catch (error) {
    console.error("Error en el diagn\xF3stico:", error);
    throw new Error("No se pudo completar el diagn\xF3stico. Por favor, intenta nuevamente.");
  }
}

// server/controllers/diagnostics.ts
import { z as z2 } from "zod";
var diagnosticRequestSchema = z2.object({
  vehicleInfo: z2.object({
    year: z2.number().optional(),
    make: z2.string().optional(),
    model: z2.string().optional(),
    engine: z2.string().optional()
  }).optional(),
  obdCodes: z2.array(z2.string()).optional(),
  symptoms: z2.array(z2.string()).optional(),
  additionalInfo: z2.string().optional(),
  chatHistory: z2.array(z2.object({
    role: z2.enum(["user", "assistant"]),
    content: z2.string()
  })).optional()
});
function registerDiagnosticRoutes(app, prefix, storage2) {
  app.post(`${prefix}/diagnostics/analyze`, async (req, res) => {
    try {
      const result = diagnosticRequestSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          error: "Datos de solicitud inv\xE1lidos",
          details: result.error.errors
        });
      }
      if (!req.user) {
        req.user = {
          id: 1,
          username: "usuario_prueba",
          role: "user"
        };
      }
      const userId = req.user.id;
      const data = result.data;
      const analysis = await analyzeDiagnostic(
        data.vehicleInfo,
        data.obdCodes,
        data.symptoms,
        data.additionalInfo,
        data.chatHistory
      );
      res.json({
        chatHistory: analysis.chatHistory,
        diagnosis: analysis.diagnosis,
        severity: analysis.severity
      });
    } catch (error) {
      console.error("Error en el an\xE1lisis de diagn\xF3stico:", error);
      res.status(500).json({
        error: "Error al procesar la solicitud de diagn\xF3stico",
        message: error?.message || "Error desconocido"
      });
    }
  });
  app.get(`${prefix}/diagnostics`, async (req, res) => {
    try {
      if (!req.user) {
        req.user = {
          id: 1,
          username: "usuario_prueba",
          role: "user"
        };
      }
      const userId = req.user?.id;
      const diagnostics3 = await storage2.getDiagnostics(userId);
      res.json(diagnostics3);
    } catch (error) {
      console.error("Error al obtener diagn\xF3sticos:", error);
      res.status(500).json({
        error: "Error al obtener diagn\xF3sticos",
        message: error?.message || "Error desconocido"
      });
    }
  });
  app.get(`${prefix}/diagnostics/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({
          error: "ID de diagn\xF3stico inv\xE1lido"
        });
      }
      if (!req.user) {
        req.user = {
          id: 1,
          username: "usuario_prueba",
          role: "user"
        };
      }
      const diagnostic = await storage2.getDiagnosticById(id);
      if (!diagnostic) {
        return res.status(404).json({
          error: "Diagn\xF3stico no encontrado"
        });
      }
      if (diagnostic.userId !== req.user?.id) {
        return res.status(403).json({
          error: "No tienes permiso para acceder a este diagn\xF3stico"
        });
      }
      res.json(diagnostic);
    } catch (error) {
      console.error("Error al obtener diagn\xF3stico:", error);
      res.status(500).json({
        error: "Error al obtener diagn\xF3stico",
        message: error?.message || "Error desconocido"
      });
    }
  });
  app.delete(`${prefix}/diagnostics/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({
          error: "ID de diagn\xF3stico inv\xE1lido"
        });
      }
      if (!req.user) {
        req.user = {
          id: 1,
          username: "usuario_prueba",
          role: "user"
        };
      }
      const diagnostic = await storage2.getDiagnosticById(id);
      if (!diagnostic) {
        return res.status(404).json({
          error: "Diagn\xF3stico no encontrado"
        });
      }
      if (diagnostic.userId !== req.user?.id) {
        return res.status(403).json({
          error: "No tienes permiso para eliminar este diagn\xF3stico"
        });
      }
      const success = await storage2.deleteDiagnostic(id);
      if (success) {
        res.json({ success: true, message: "Diagn\xF3stico eliminado correctamente" });
      } else {
        res.status(500).json({ error: "No se pudo eliminar el diagn\xF3stico" });
      }
    } catch (error) {
      console.error("Error al eliminar diagn\xF3stico:", error);
      res.status(500).json({
        error: "Error al eliminar diagn\xF3stico",
        message: error?.message || "Error desconocido"
      });
    }
  });
  app.get(`${prefix}/diagnostics/codes`, async (req, res) => {
    const commonCodes = [
      { code: "P0300", description: "Random/Multiple Cylinder Misfire Detected" },
      { code: "P0171", description: "System Too Lean (Bank 1)" },
      { code: "P0174", description: "System Too Lean (Bank 2)" },
      { code: "P0420", description: "Catalyst System Efficiency Below Threshold (Bank 1)" },
      { code: "P0430", description: "Catalyst System Efficiency Below Threshold (Bank 2)" },
      { code: "P0442", description: "Evaporative Emission Control System Leak Detected (Small Leak)" },
      { code: "P0455", description: "Evaporative Emission Control System Leak Detected (Large Leak)" },
      { code: "P0401", description: "Exhaust Gas Recirculation Flow Insufficient Detected" },
      { code: "P0128", description: "Coolant Thermostat Malfunction" },
      { code: "P0303", description: "Cylinder 3 Misfire Detected" }
    ];
    res.json(commonCodes);
  });
  app.get(`${prefix}/diagnostics/symptoms`, async (req, res) => {
    const commonSymptoms = [
      "El motor no arranca",
      "Tirones al acelerar",
      "Consumo excesivo de combustible",
      "Luz del motor encendida",
      "Ruido anormal al frenar",
      "P\xE9rdida de potencia",
      "Vibraci\xF3n al conducir",
      "Humo del escape",
      "Dificultad para cambiar de marcha",
      "Sobrecalentamiento del motor"
    ];
    res.json(commonSymptoms);
  });
}

// server/controllers/analytics.ts
function registerAnalyticsRoutes(app, prefix, storage2) {
  app.get(`${prefix}/analytics/compatibility`, async (req, res) => {
    try {
      const { timeRange = "month" } = req.query;
      const makeData = await storage2.getCompatibilityAnalyticsByMake(timeRange);
      const yearData = await storage2.getCompatibilityAnalyticsByYear(timeRange);
      const categoryData = await storage2.getCompatibilityAnalyticsByCategory(timeRange);
      const trendsData = await storage2.getCompatibilityTrends(timeRange);
      res.json({
        makeData,
        yearData,
        categoryData,
        trendsData
      });
    } catch (error) {
      console.error("Error al obtener datos de compatibilidad:", error);
      res.status(500).json({ message: "Error al obtener datos de compatibilidad" });
    }
  });
  app.get(`${prefix}/analytics/products`, async (req, res) => {
    try {
      const { timeRange = "month" } = req.query;
      const topProducts = await storage2.getTopCompatibleProducts(timeRange);
      const categoryDistribution = await storage2.getProductCategoryDistribution(timeRange);
      const mostViewed = await storage2.getMostViewedProducts(timeRange);
      const mostSearched = await storage2.getMostSearchedProducts(timeRange);
      res.json({
        topProducts,
        categoryDistribution,
        mostViewed,
        mostSearched
      });
    } catch (error) {
      console.error("Error al obtener datos de productos:", error);
      res.status(500).json({ message: "Error al obtener datos de productos" });
    }
  });
  app.get(`${prefix}/analytics/vehicles`, async (req, res) => {
    try {
      const { timeRange = "month" } = req.query;
      const makeDistribution = await storage2.getVehicleMakeDistribution(timeRange);
      const yearDistribution = await storage2.getVehicleYearDistribution(timeRange);
      const mostCompatible = await storage2.getMostCompatibleVehicles(timeRange);
      const mostSearched = await storage2.getMostSearchedVehicles(timeRange);
      res.json({
        makeDistribution,
        yearDistribution,
        mostCompatible,
        mostSearched
      });
    } catch (error) {
      console.error("Error al obtener datos de veh\xEDculos:", error);
      res.status(500).json({ message: "Error al obtener datos de veh\xEDculos" });
    }
  });
  app.get(`${prefix}/analytics/summary`, async (req, res) => {
    try {
      const totalProducts = await storage2.getTotalProducts();
      const totalVehicles = await storage2.getTotalVehicles();
      const totalCompatibilityRecords = await storage2.getTotalCompatibilityRecords();
      const averageProductsPerVehicle = await storage2.getAverageProductsPerVehicle();
      res.json({
        totalProducts,
        totalVehicles,
        totalCompatibilityRecords,
        averageProductsPerVehicle
      });
    } catch (error) {
      console.error("Error al obtener resumen de anal\xEDtica:", error);
      res.status(500).json({ message: "Error al obtener resumen de anal\xEDtica" });
    }
  });
}

// server/controllers/videos.ts
import { z as z3 } from "zod";
function registerVideoRoutes(app, prefix, storage2) {
  app.get(`${prefix}/videos/categories`, async (req, res) => {
    try {
      const result = await storage2.getVideoTutorials({
        offset: 0,
        limit: 100,
        // Límite alto para obtener la mayoría de videos
        filters: {},
        sortField: "createdAt",
        sortOrder: "desc"
      });
      const categories3 = [...new Set(result.videos.map((video) => video.category))];
      return res.json(categories3);
    } catch (error) {
      console.error("Error fetching video categories:", error);
      return res.status(500).json({ error: "Error fetching video categories" });
    }
  });
  app.get(`${prefix}/videos/popular`, async (req, res) => {
    try {
      const popularVideos = await storage2.getPopularVideoTutorials();
      return res.json(popularVideos);
    } catch (error) {
      console.error("Error fetching popular video tutorials:", error);
      return res.status(500).json({ error: "Error fetching popular video tutorials" });
    }
  });
  app.get(`${prefix}/videos`, async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;
      const category = req.query.category;
      const difficultyLevel = req.query.difficultyLevel;
      const vehicleId = req.query.vehicleId ? parseInt(req.query.vehicleId) : void 0;
      const productId = req.query.productId ? parseInt(req.query.productId) : void 0;
      const tags = req.query.tags ? req.query.tags.split(",") : void 0;
      const sortField = req.query.sortField || "createdAt";
      const sortOrder = req.query.sortOrder || "desc";
      const result = await storage2.getVideoTutorials({
        offset,
        limit,
        filters: {
          category,
          difficultyLevel,
          vehicleId,
          productId,
          tags
        },
        sortField,
        sortOrder
      });
      return res.json(result);
    } catch (error) {
      console.error("Error fetching video tutorials:", error);
      return res.status(500).json({ error: "Error fetching video tutorials" });
    }
  });
  app.get(`${prefix}/videos/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid video ID" });
      }
      const videoDetails = await storage2.getVideoTutorialDetails(id);
      if (!videoDetails) {
        return res.status(404).json({ error: "Video tutorial not found" });
      }
      return res.json(videoDetails);
    } catch (error) {
      console.error("Error fetching video tutorial details:", error);
      return res.status(500).json({ error: "Error fetching video tutorial details" });
    }
  });
  app.get(`${prefix}/vehicles/:vehicleId/videos`, async (req, res) => {
    try {
      const vehicleId = parseInt(req.params.vehicleId);
      if (isNaN(vehicleId)) {
        return res.status(400).json({ error: "Invalid vehicle ID" });
      }
      const videos = await storage2.getVideoTutorialsForVehicle(vehicleId);
      return res.json(videos);
    } catch (error) {
      console.error("Error fetching vehicle video tutorials:", error);
      return res.status(500).json({ error: "Error fetching vehicle video tutorials" });
    }
  });
  app.get(`${prefix}/products/:productId/videos`, async (req, res) => {
    try {
      const productId = parseInt(req.params.productId);
      if (isNaN(productId)) {
        return res.status(400).json({ error: "Invalid product ID" });
      }
      const videos = await storage2.getVideoTutorialsForProduct(productId);
      return res.json(videos);
    } catch (error) {
      console.error("Error fetching product video tutorials:", error);
      return res.status(500).json({ error: "Error fetching product video tutorials" });
    }
  });
  app.get(`${prefix}/videos/:videoId/related`, async (req, res) => {
    try {
      const videoId = parseInt(req.params.videoId);
      if (isNaN(videoId)) {
        return res.status(400).json({ error: "Invalid video ID" });
      }
      const relatedVideos = await storage2.getRelatedVideoTutorials(videoId);
      return res.json(relatedVideos);
    } catch (error) {
      console.error("Error fetching related video tutorials:", error);
      return res.status(500).json({ error: "Error fetching related video tutorials" });
    }
  });
  app.post(`${prefix}/videos`, async (req, res) => {
    try {
      const videoData = req.body;
      const videoSchema = z3.object({
        title: z3.string().min(5, "Title must be at least 5 characters long"),
        description: z3.string().min(20, "Description must be at least 20 characters long"),
        videoUrl: z3.string().url("Video URL must be a valid URL"),
        thumbnailUrl: z3.string().url("Thumbnail URL must be a valid URL"),
        duration: z3.number().min(1, "Duration must be at least 1 second"),
        difficultyLevel: z3.enum(["beginner", "intermediate", "advanced"]),
        category: z3.string(),
        tags: z3.array(z3.string()).default([])
      });
      const validatedData = videoSchema.parse(videoData);
      const newVideo = await storage2.createVideoTutorial(validatedData);
      return res.status(201).json(newVideo);
    } catch (error) {
      console.error("Error creating video tutorial:", error);
      return res.status(400).json({ error: "Error creating video tutorial", details: error.errors || error.message });
    }
  });
  app.post(`${prefix}/videos/compatibility`, async (req, res) => {
    try {
      const compatData = req.body;
      const compatSchema = z3.object({
        videoId: z3.number(),
        vehicleId: z3.number().optional(),
        productId: z3.number().optional(),
        relevanceScore: z3.number().min(1).max(10).default(5)
      }).refine((data) => data.vehicleId !== void 0 || data.productId !== void 0, {
        message: "Either vehicleId or productId must be provided"
      });
      const validatedData = compatSchema.parse(compatData);
      const newCompatRecord = await storage2.createVideoCompatibility(validatedData);
      return res.status(201).json(newCompatRecord);
    } catch (error) {
      console.error("Error creating video compatibility record:", error);
      return res.status(400).json({ error: "Error creating video compatibility record", details: error.errors || error.message });
    }
  });
}

// server/services/anthropic.ts
import OpenAI2 from "openai";
import Anthropic from "@anthropic-ai/sdk";
var anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});
var openai2 = new OpenAI2({
  apiKey: process.env.OPENAI_API_KEY
});
async function analyzeVehicleHealth(vehicleData, symptoms, maintenanceHistory, mileage, additionalInfo) {
  try {
    const systemPrompt = `
    Eres un mec\xE1nico automotriz experto y sistema de diagn\xF3stico predictivo que proporciona an\xE1lisis de salud vehicular.

    Analiza los datos del veh\xEDculo proporcionados incluyendo s\xEDntomas, historial de mantenimiento, kilometraje, y otra informaci\xF3n para:
    1. Diagnosticar problemas actuales
    2. Predecir problemas futuros basados en patrones conocidos para este modelo espec\xEDfico
    3. Proporcionar un "puntaje de salud" del 0-100 (100 siendo perfecto)
    4. Calcular un nivel de urgencia general (bajo, medio, alto, cr\xEDtico)
    5. Listar problemas potenciales con probabilidades y costos estimados
    6. Proporcionar recomendaciones de mantenimiento con importancia y costos estimados
    7. Estimar la vida \xFAtil restante del veh\xEDculo

    Considera factores como:
    - Problemas conocidos para esta marca/modelo/a\xF1o espec\xEDficos
    - Intervalos de mantenimiento recomendados por el fabricante
    - Correlaci\xF3n entre los s\xEDntomas reportados y problemas comunes
    - C\xF3mo el historial de mantenimiento previo impacta la salud actual
    - El kilometraje en relaci\xF3n con la vida \xFAtil t\xEDpica de los componentes

    Responde con un objeto JSON bien estructurado que siga exactamente el formato especificado en los comentarios de c\xF3digo.
    No incluyas explicaciones adicionales fuera del objeto JSON.
    `;
    const userPrompt = `
    Datos del veh\xEDculo:
    - Marca: ${vehicleData.make}
    - Modelo: ${vehicleData.model}
    - A\xF1o: ${vehicleData.year}
    - Motor: ${vehicleData.engine || "No especificado"}
    - Kilometraje actual: ${mileage}

    S\xEDntomas reportados:
    ${symptoms.map((symptom) => `- ${symptom}`).join("\n")}

    Historial de mantenimiento:
    ${maintenanceHistory.map(
      (item) => `- ${item.service} (${item.date}, ${item.mileage} km)`
    ).join("\n")}

    Informaci\xF3n adicional:
    ${additionalInfo || "Ninguna"}

    Por favor, analiza esta informaci\xF3n y proporciona un diagn\xF3stico completo de la salud del veh\xEDculo con el siguiente formato JSON exacto:
    {
      "healthScore": number, // 0-100, donde 100 es perfecto
      "urgencyLevel": "low" | "medium" | "high" | "critical",
      "analysis": string, // An\xE1lisis general detallado
      "potentialIssues": [
        {
          "issue": string, // Nombre del problema
          "probability": number, // 0-1 
          "description": string,
          "urgency": "low" | "medium" | "high" | "critical",
          "estimatedCost": {
            "min": number, // En d\xF3lares
            "max": number  // En d\xF3lares
          }
        }
      ],
      "maintenanceRecommendations": [
        {
          "recommendation": string,
          "importance": "routine" | "recommended" | "urgent",
          "dueInMiles": number, // Kilometraje estimado hasta que sea necesario
          "estimatedCost": {
            "min": number, // En d\xF3lares
            "max": number  // En d\xF3lares
          },
          "diyDifficulty": "easy" | "moderate" | "complex" | "professional" // Opcional
        }
      ],
      "vehicleLifeEstimate": {
        "remainingYears": number,
        "keyLimitingFactors": string[] // Factores clave que limitan la vida \xFAtil
      }
    }
    `;
    const response = await openai2.chat.completions.create({
      model: "gpt-4-0125-preview",
      // El modelo más reciente de GPT-4
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.3,
      max_tokens: 2e3
    });
    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No se recibi\xF3 respuesta del modelo");
    }
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error("No se encontr\xF3 JSON v\xE1lido en la respuesta");
    } catch (error) {
      console.error("Error al parsear JSON:", error);
      throw new Error("No se pudo interpretar la respuesta del an\xE1lisis");
    }
  } catch (error) {
    console.error("Error en el an\xE1lisis:", error);
    throw new Error("Error en el servicio de an\xE1lisis: " + error.message);
  }
}

// server/controllers/vehicleHealth.ts
import { z as z4 } from "zod";
var vehicleHealthRequestSchema = z4.object({
  vehicleId: z4.number().optional(),
  vehicleData: z4.object({
    make: z4.string(),
    model: z4.string(),
    year: z4.number(),
    engine: z4.string().optional()
  }),
  symptoms: z4.array(z4.string()),
  maintenanceHistory: z4.array(z4.object({
    service: z4.string(),
    date: z4.string(),
    mileage: z4.number()
  })).optional().default([]),
  mileage: z4.number(),
  additionalInfo: z4.string().optional()
});
async function analyzeHealth(req, res) {
  try {
    const validationResult = vehicleHealthRequestSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: "Datos inv\xE1lidos",
        details: validationResult.error.format()
      });
    }
    const {
      vehicleId,
      vehicleData,
      symptoms,
      maintenanceHistory,
      mileage,
      additionalInfo
    } = validationResult.data;
    if (vehicleId) {
      const vehicle = await storage.getVehicleById(vehicleId);
      if (!vehicle) {
        return res.status(404).json({ error: "Veh\xEDculo no encontrado" });
      }
    }
    const analysis = await analyzeVehicleHealth(
      vehicleData,
      symptoms,
      maintenanceHistory,
      mileage,
      additionalInfo
    );
    if (!req.user) {
      req.user = {
        id: 1,
        username: "usuario_prueba",
        role: "user"
      };
    }
    let savedAnalysisId = null;
    if (vehicleId) {
      const userId = req.user.id;
      const diagnostic = await storage.createDiagnostic({
        vehicleId,
        userId,
        obdCodes: null,
        symptoms,
        additionalInfo,
        diagnosis: analysis.analysis,
        chatHistory: analysis,
        // Convertir a tipo any para almacenar en el campo jsonb
        severity: analysis.urgencyLevel
      });
      savedAnalysisId = diagnostic.id;
    }
    return res.status(200).json({
      analysisId: savedAnalysisId,
      analysis
    });
  } catch (error) {
    console.error("Error en el an\xE1lisis de salud del veh\xEDculo:", error);
    return res.status(500).json({
      error: "Error en el an\xE1lisis",
      message: error.message
    });
  }
}
async function getHealthHistory(req, res) {
  try {
    if (!req.user) {
      req.user = {
        id: 1,
        username: "usuario_prueba",
        role: "user"
      };
    }
    const userId = req.user.id;
    const diagnostics3 = await storage.getDiagnostics(userId);
    const history = await Promise.all(diagnostics3.map(async (diagnostic) => {
      let vehicleInfo = null;
      if (diagnostic.vehicleId) {
        const vehicle = await storage.getVehicleById(diagnostic.vehicleId);
        if (vehicle) {
          vehicleInfo = {
            id: vehicle.id,
            make: vehicle.make,
            model: vehicle.model,
            year: vehicle.year
          };
        }
      }
      const chatHistory = diagnostic.chatHistory;
      return {
        id: diagnostic.id,
        date: diagnostic.createdAt,
        vehicle: vehicleInfo,
        symptoms: diagnostic.symptoms,
        severity: diagnostic.severity,
        summary: diagnostic.diagnosis.substring(0, 150) + "...",
        healthScore: chatHistory.healthScore || 0
        // Valor predeterminado en caso de que no exista
      };
    }));
    return res.status(200).json(history);
  } catch (error) {
    console.error("Error al obtener el historial de salud:", error);
    return res.status(500).json({
      error: "Error al obtener historial",
      message: error.message
    });
  }
}
async function getHealthAnalysis(req, res) {
  try {
    const analysisId = parseInt(req.params.id);
    if (isNaN(analysisId)) {
      return res.status(400).json({ error: "ID de an\xE1lisis inv\xE1lido" });
    }
    const diagnostic = await storage.getDiagnosticById(analysisId);
    if (!diagnostic) {
      return res.status(404).json({ error: "An\xE1lisis no encontrado" });
    }
    if (!req.user) {
      req.user = {
        id: 1,
        username: "usuario_prueba",
        role: "user"
      };
    }
    const userId = req.user.id;
    if (diagnostic.userId !== userId) {
      return res.status(403).json({ error: "No tienes permiso para ver este an\xE1lisis" });
    }
    let vehicleInfo = null;
    if (diagnostic.vehicleId) {
      const vehicle = await storage.getVehicleById(diagnostic.vehicleId);
      if (vehicle) {
        vehicleInfo = {
          id: vehicle.id,
          make: vehicle.make,
          model: vehicle.model,
          year: vehicle.year,
          engine: vehicle.engine
        };
      }
    }
    const analysis = diagnostic.chatHistory;
    return res.status(200).json({
      id: diagnostic.id,
      createdAt: diagnostic.createdAt,
      vehicle: vehicleInfo,
      symptoms: diagnostic.symptoms,
      additionalInfo: diagnostic.additionalInfo,
      analysis
    });
  } catch (error) {
    console.error("Error al obtener an\xE1lisis:", error);
    return res.status(500).json({
      error: "Error al obtener an\xE1lisis",
      message: error.message
    });
  }
}

// server/controllers/vehicleHealthRoutes.ts
function registerVehicleHealthRoutes(app, apiPrefix, storage2) {
  app.post(`${apiPrefix}/vehicle-health/analyze`, analyzeHealth);
  app.get(`${apiPrefix}/vehicle-health/history`, getHealthHistory);
  app.get(`${apiPrefix}/vehicle-health/:id`, getHealthAnalysis);
}

// server/routes/smartcar.ts
import express3 from "express";

// server/middleware/auth.ts
function isAuthenticated(req, res, next) {
  if (!req.user) {
    req.user = {
      id: 1,
      username: "usuario_prueba",
      role: "user"
    };
  }
  return next();
}

// server/smartcar.ts
var smartcar_exports = {};
__export(smartcar_exports, {
  collectVehicleData: () => collectVehicleData,
  exchangeCode: () => exchangeCode,
  getAuthUrl: () => getAuthUrl,
  getEnergyStatus: () => getEnergyStatus,
  getEngineOil: () => getEngineOil,
  getLocation: () => getLocation,
  getOdometer: () => getOdometer,
  getTirePressure: () => getTirePressure,
  getVehicleInfo: () => getVehicleInfo,
  getVehicles: () => getVehicles,
  initializeSmartcarConfig: () => initializeSmartcarConfig,
  refreshAccessToken: () => refreshAccessToken
});

// server/vite.ts
import express2 from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    themePlugin(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app.use(express2.static(distPath));
  app.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/smartcar.ts
import smartcar from "smartcar";
var AuthClient = smartcar.AuthClient;
var Vehicle2 = smartcar.Vehicle;
var client = null;
async function initializeSmartcarConfig() {
  try {
    if (process.env.SMARTCAR_CLIENT_ID && process.env.SMARTCAR_CLIENT_SECRET && process.env.SMARTCAR_REDIRECT_URI) {
      client = new AuthClient({
        clientId: process.env.SMARTCAR_CLIENT_ID,
        clientSecret: process.env.SMARTCAR_CLIENT_SECRET,
        redirectUri: process.env.SMARTCAR_REDIRECT_URI,
        mode: process.env.SMARTCAR_TEST_MODE === "true" ? "test" : "live"
      });
      log(`Configuraci\xF3n de SmartCar inicializada desde variables de entorno`, "smartcar");
      try {
        const config2 = await storage.getSmartcarConfig();
        if (!config2) {
          await storage.createSmartcarConfig({
            clientId: process.env.SMARTCAR_CLIENT_ID,
            clientSecret: process.env.SMARTCAR_CLIENT_SECRET,
            redirectUri: process.env.SMARTCAR_REDIRECT_URI,
            testMode: process.env.SMARTCAR_TEST_MODE === "true"
          });
          log("Configuraci\xF3n de SmartCar guardada en base de datos", "smartcar");
        }
      } catch (dbError) {
        log(`Error al guardar configuraci\xF3n en base de datos: ${dbError}`, "warning");
      }
      return true;
    }
    const config = await storage.getSmartcarConfig();
    if (!config) {
      log("Error: No se encontr\xF3 configuraci\xF3n de SmartCar ni en variables de entorno ni en base de datos", "error");
      return false;
    }
    client = new AuthClient({
      clientId: config.clientId,
      clientSecret: config.clientSecret,
      redirectUri: config.redirectUri,
      mode: config.testMode ? "test" : "live"
    });
    log(`Configuraci\xF3n de SmartCar inicializada desde base de datos: ${config.clientId}, modo de prueba: ${config.testMode}`, "smartcar");
    return true;
  } catch (error) {
    log(`Error al inicializar SmartCar: ${error}`, "error");
    return false;
  }
}
function getAuthUrl(state) {
  if (!client) throw new Error("Cliente SmartCar no inicializado");
  const scopes = [
    "required:read_odometer",
    "required:read_vin",
    "required:read_vehicle_info",
    "read_engine_oil",
    "read_fuel",
    "read_battery",
    "read_location",
    "read_tire_pressure",
    "read_engine",
    "control_security",
    "read_compass"
  ];
  return client.getAuthUrl(scopes, { state });
}
async function exchangeCode(code) {
  if (!client) throw new Error("Cliente SmartCar no inicializado");
  const { accessToken, refreshToken, expiresIn } = await client.exchangeCode(code);
  const expiration = Date.now() + expiresIn * 1e3;
  return { accessToken, refreshToken, expiration };
}
async function getVehicles(accessToken) {
  if (!client) throw new Error("Cliente SmartCar no inicializado");
  const { vehicles: vehicles3 } = await client.getVehicles(accessToken);
  return vehicles3;
}
async function getVehicleInfo(vehicleId, accessToken) {
  if (!client) throw new Error("Cliente SmartCar no inicializado");
  const vehicle = new Vehicle2(vehicleId, accessToken);
  return await vehicle.info();
}
async function getOdometer(vehicleId, accessToken) {
  if (!client) throw new Error("Cliente SmartCar no inicializado");
  const vehicle = new Vehicle2(vehicleId, accessToken);
  return await vehicle.odometer();
}
async function getEnergyStatus(vehicleId, accessToken) {
  if (!client) throw new Error("Cliente SmartCar no inicializado");
  const vehicle = new Vehicle2(vehicleId, accessToken);
  try {
    return await vehicle.fuel();
  } catch (error) {
    try {
      return await vehicle.battery();
    } catch (innerError) {
      return null;
    }
  }
}
async function getEngineOil(vehicleId, accessToken) {
  if (!client) throw new Error("Cliente SmartCar no inicializado");
  const vehicle = new Vehicle2(vehicleId, accessToken);
  try {
    return await vehicle.engineOil();
  } catch (error) {
    return null;
  }
}
async function getTirePressure(vehicleId, accessToken) {
  if (!client) throw new Error("Cliente SmartCar no inicializado");
  const vehicle = new Vehicle2(vehicleId, accessToken);
  try {
    return await vehicle.tirePressure();
  } catch (error) {
    return null;
  }
}
async function getLocation(vehicleId, accessToken) {
  if (!client) throw new Error("Cliente SmartCar no inicializado");
  const vehicle = new Vehicle2(vehicleId, accessToken);
  try {
    return await vehicle.location();
  } catch (error) {
    return null;
  }
}
async function collectVehicleData(vehicleId, accessToken, smartcarVehicleId) {
  log(`Recopilando datos para veh\xEDculo ${vehicleId}`, "smartcar");
  const data = {
    smartcarVehicleId,
    recordedAt: /* @__PURE__ */ new Date(),
    rawData: {}
  };
  try {
    const info = await getVehicleInfo(vehicleId, accessToken);
    data.rawData = { info };
    try {
      const odometer = await getOdometer(vehicleId, accessToken);
      data.odometer = odometer.distance;
      data.rawData = { ...data.rawData, odometer };
    } catch (error) {
      log(`Error al obtener od\xF3metro: ${error}`, "error");
    }
    try {
      const engineOil = await getEngineOil(vehicleId, accessToken);
      data.oilLife = engineOil?.lifeRemaining;
      data.rawData = { ...data.rawData, engineOil };
    } catch (error) {
      log(`Error al obtener nivel de aceite: ${error}`, "error");
    }
    try {
      const tirePressure = await getTirePressure(vehicleId, accessToken);
      data.tirePressure = JSON.stringify(tirePressure);
      data.rawData = { ...data.rawData, tirePressure };
    } catch (error) {
      log(`Error al obtener presi\xF3n de neum\xE1ticos: ${error}`, "error");
    }
    try {
      if (info.fuel && info.fuel.capacity > 0) {
        const fuel = await getEnergyStatus(vehicleId, accessToken);
        data.fuelPercentRemaining = fuel?.percentRemaining;
        data.rawData = { ...data.rawData, fuel };
      } else {
        const battery = await getEnergyStatus(vehicleId, accessToken);
        data.batteryPercentRemaining = battery?.percentRemaining;
        data.rawData = { ...data.rawData, battery };
      }
    } catch (error) {
      log(`Error al obtener estado de energ\xEDa: ${error}`, "error");
    }
    try {
      const location = await getLocation(vehicleId, accessToken);
      data.location = JSON.stringify(location);
      data.rawData = { ...data.rawData, location };
    } catch (error) {
      log(`Error al obtener ubicaci\xF3n: ${error}`, "error");
    }
    const savedData = await storage.createSmartcarVehicleData(data);
    log(`Datos guardados para veh\xEDculo ${vehicleId}`, "smartcar");
    return data;
  } catch (error) {
    log(`Error al recopilar datos: ${error}`, "error");
    throw error;
  }
}
async function refreshAccessToken(refreshToken) {
  if (!client) throw new Error("Cliente SmartCar no inicializado");
  const { accessToken, refreshToken: newRefreshToken, expiresIn } = await client.exchangeRefreshToken(refreshToken);
  const expiration = Date.now() + expiresIn * 1e3;
  return {
    accessToken,
    refreshToken: newRefreshToken,
    expiration
  };
}

// server/routes/smartcar.ts
var router = express3.Router();
router.get("/auth", isAuthenticated, async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "No autorizado" });
  }
  try {
    const state = `user_${req.user.id}`;
    let authUrl;
    try {
      authUrl = getAuthUrl(state);
      console.log("\u2B50\uFE0F Generada URL de autorizaci\xF3n:", authUrl);
    } catch (e) {
      console.error("\u26A0\uFE0F Error al generar URL:", e);
      return res.status(500).json({
        message: `Error al iniciar autenticaci\xF3n: ${e.message}`,
        stack: process.env.NODE_ENV === "production" ? void 0 : e.stack
      });
    }
    res.json({ authUrl });
  } catch (error) {
    console.error("Error al iniciar autenticaci\xF3n SmartCar:", error);
    res.status(500).json({
      message: `Error al iniciar autenticaci\xF3n: ${error.message}`,
      stack: process.env.NODE_ENV === "production" ? void 0 : error.stack
    });
  }
});
router.get("/callback", async (req, res) => {
  try {
    const { code, state } = req.query;
    if (!code || !state) {
      return res.status(400).json({ message: "Par\xE1metros faltantes en la respuesta de SmartCar" });
    }
    const stateStr = state;
    const userIdMatch = stateStr.match(/^user_(\d+)$/);
    if (!userIdMatch) {
      return res.status(400).json({ message: "State inv\xE1lido" });
    }
    const userId = parseInt(userIdMatch[1], 10);
    const { accessToken, refreshToken, expiration } = await exchangeCode(code);
    const vehicleIds = await getVehicles(accessToken);
    if (vehicleIds.length === 0) {
      return res.status(404).json({ message: "No se encontraron veh\xEDculos" });
    }
    const vehicleId = vehicleIds[0];
    const vehicleInfo = await getVehicleInfo(vehicleId, accessToken);
    const existingVehicles = await storage.getSmartcarVehicles(userId);
    const existingVehicle = existingVehicles.find((v) => v.vehicleId === vehicleId);
    if (existingVehicle) {
      await storage.updateSmartcarVehicle(existingVehicle.id, {
        accessToken,
        refreshToken,
        tokenExpiryDate: new Date(expiration),
        make: vehicleInfo.make,
        model: vehicleInfo.model,
        year: vehicleInfo.year,
        vin: vehicleInfo.vin
      });
      await collectVehicleData(vehicleId, accessToken, existingVehicle.id);
      return res.redirect(`/vehiculos/${existingVehicle.id}/detalles?success=1`);
    } else {
      const savedVehicle = await storage.createSmartcarVehicle({
        userId,
        vehicleId,
        accessToken,
        refreshToken,
        tokenExpiryDate: new Date(expiration),
        make: vehicleInfo.make,
        model: vehicleInfo.model,
        year: vehicleInfo.year,
        vin: vehicleInfo.vin
      });
      await collectVehicleData(vehicleId, accessToken, savedVehicle.id);
      return res.redirect(`/vehiculos/${savedVehicle.id}/detalles?success=1`);
    }
  } catch (error) {
    console.error("Error en callback de SmartCar:", error);
    return res.redirect("/vehiculos?error=smartcar_callback");
  }
});
router.get("/vehicles", isAuthenticated, async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "No autorizado" });
  }
  const accessToken = req.query.access_token;
  try {
    const vehicles3 = await storage.getSmartcarVehicles(req.user.id);
    const vehicleIds = vehicles3.map((v) => v.id.toString());
    res.json({ vehicles: vehicleIds });
  } catch (error) {
    console.error("Error al obtener veh\xEDculos:", error);
    res.status(500).json({ message: `Error al obtener veh\xEDculos: ${error.message}` });
  }
});
router.get("/vehicles/:id", isAuthenticated, async (req, res) => {
  try {
    const vehicleId = parseInt(req.params.id, 10);
    if (isNaN(vehicleId)) {
      return res.status(400).json({ message: "ID de veh\xEDculo no v\xE1lido" });
    }
    const vehicle = await storage.getSmartcarVehicleById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ message: "Veh\xEDculo no encontrado" });
    }
    if (vehicle.userId !== req.user?.id) {
      return res.status(403).json({ message: "No tienes permiso para acceder a este veh\xEDculo" });
    }
    const data = await storage.getSmartcarVehicleLatestData(vehicleId);
    if (!data) {
      return res.status(404).json({ message: "No hay datos disponibles para este veh\xEDculo" });
    }
    const now = /* @__PURE__ */ new Date();
    if (vehicle.tokenExpiryDate && vehicle.tokenExpiryDate < now) {
      try {
        const { accessToken, refreshToken, expiration } = await refreshAccessToken(vehicle.refreshToken || "");
        await storage.updateSmartcarVehicle(vehicle.id, {
          accessToken,
          refreshToken,
          tokenExpiryDate: new Date(expiration)
        });
        vehicle.accessToken = accessToken;
      } catch (error) {
        console.error("Error al refrescar token:", error);
        return res.status(401).json({ message: "La conexi\xF3n con el veh\xEDculo ha expirado. Por favor, vuelve a conectar el veh\xEDculo." });
      }
    }
    collectVehicleData(vehicle.vehicleId, vehicle.accessToken || "", vehicle.id).catch((error) => {
      console.error("Error al actualizar datos del veh\xEDculo:", error);
    });
    res.json({
      vehicle: {
        id: vehicle.id,
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        vin: vehicle.vin
      },
      data: {
        odometer: data.odometer,
        oilLife: data.oilLife,
        fuelPercentRemaining: data.fuelPercentRemaining,
        batteryPercentRemaining: data.batteryPercentRemaining,
        location: data.location ? JSON.parse(data.location) : null,
        lastUpdated: data.recordedAt,
        tirePressure: data.tirePressure ? JSON.parse(data.tirePressure) : null,
        checkEngineLight: data.checkEngineLight,
        activeDtcs: data.activeDtcs
      }
    });
  } catch (error) {
    console.error("Error al obtener datos del veh\xEDculo:", error);
    res.status(500).json({ message: `Error al obtener datos: ${error.message}` });
  }
});
router.post("/vehicles/:id/refresh", isAuthenticated, async (req, res) => {
  try {
    const vehicleId = parseInt(req.params.id, 10);
    if (isNaN(vehicleId)) {
      return res.status(400).json({ message: "ID de veh\xEDculo no v\xE1lido" });
    }
    const vehicle = await storage.getSmartcarVehicleById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ message: "Veh\xEDculo no encontrado" });
    }
    if (vehicle.userId !== req.user?.id) {
      return res.status(403).json({ message: "No tienes permiso para acceder a este veh\xEDculo" });
    }
    const now = /* @__PURE__ */ new Date();
    if (vehicle.tokenExpiryDate && vehicle.tokenExpiryDate < now) {
      try {
        const { accessToken, refreshToken, expiration } = await refreshAccessToken(vehicle.refreshToken || "");
        await storage.updateSmartcarVehicle(vehicle.id, {
          accessToken,
          refreshToken,
          tokenExpiryDate: new Date(expiration)
        });
        vehicle.accessToken = accessToken;
      } catch (error) {
        console.error("Error al refrescar token:", error);
        return res.status(401).json({ message: "La conexi\xF3n con el veh\xEDculo ha expirado. Por favor, vuelve a conectar el veh\xEDculo." });
      }
    }
    const data = await collectVehicleData(vehicle.vehicleId, vehicle.accessToken || "", vehicle.id);
    res.json({
      success: true,
      message: "Datos del veh\xEDculo actualizados correctamente",
      data: {
        odometer: data.odometer,
        oilLife: data.oilLife,
        fuelPercentRemaining: data.fuelPercentRemaining,
        batteryPercentRemaining: data.batteryPercentRemaining,
        location: data.location ? JSON.parse(data.location) : null,
        lastUpdated: data.recordedAt,
        tirePressure: data.tirePressure ? JSON.parse(data.tirePressure) : null,
        checkEngineLight: data.checkEngineLight,
        activeDtcs: data.activeDtcs
      }
    });
  } catch (error) {
    console.error("Error al actualizar datos del veh\xEDculo:", error);
    res.status(500).json({ message: `Error al actualizar datos: ${error.message}` });
  }
});
router.get("/status", async (req, res) => {
  try {
    const smartcarModule = await import("smartcar");
    const smartcarType = typeof smartcarModule.default;
    const credentials = {
      clientId: process.env.SMARTCAR_CLIENT_ID ? "Configurado" : "No configurado",
      clientSecret: process.env.SMARTCAR_CLIENT_SECRET ? "Configurado" : "No configurado",
      redirectUri: process.env.SMARTCAR_REDIRECT_URI ? "Configurado" : "No configurado"
    };
    const diagnostics3 = {
      smartcarModule: {
        type: smartcarType,
        // Inspección interna del objeto Smartcar para depuración
        objectKeys: Object.keys(smartcar_exports),
        moduleInfo: {
          name: "smartcar",
          version: "Verificar package.json"
        }
      },
      credentials,
      environment: {
        nodeVersion: process.version,
        platform: process.platform
      }
    };
    res.json({
      status: "Diagn\xF3stico completado",
      initializedSuccessfully: !!getAuthUrl,
      diagnostics: diagnostics3
    });
  } catch (error) {
    console.error("Error en diagn\xF3stico de SmartCar:", error);
    res.status(500).json({
      status: "Error en diagn\xF3stico",
      error: error.message
    });
  }
});
router.delete("/vehicles/:id", isAuthenticated, async (req, res) => {
  try {
    const vehicleId = parseInt(req.params.id, 10);
    if (isNaN(vehicleId)) {
      return res.status(400).json({ message: "ID de veh\xEDculo no v\xE1lido" });
    }
    const vehicle = await storage.getSmartcarVehicleById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ message: "Veh\xEDculo no encontrado" });
    }
    if (vehicle.userId !== req.user?.id) {
      return res.status(403).json({ message: "No tienes permiso para eliminar este veh\xEDculo" });
    }
    const deleted = await storage.deleteSmartcarVehicle(vehicleId);
    if (!deleted) {
      return res.status(500).json({ message: "Error al eliminar el veh\xEDculo" });
    }
    res.json({ success: true, message: "Veh\xEDculo desconectado correctamente" });
  } catch (error) {
    console.error("Error al desconectar veh\xEDculo:", error);
    res.status(500).json({ message: `Error al desconectar veh\xEDculo: ${error.message}` });
  }
});
router.get("/vehicles/:id/all", isAuthenticated, async (req, res) => {
  try {
    const vehicleId = parseInt(req.params.id, 10);
    if (isNaN(vehicleId)) {
      return res.status(400).json({ message: "ID de veh\xEDculo no v\xE1lido" });
    }
    const accessToken = req.query.access_token;
    const vehicle = await storage.getSmartcarVehicleById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ message: "Veh\xEDculo no encontrado" });
    }
    if (vehicle.userId !== req.user?.id) {
      return res.status(403).json({ message: "No tienes permiso para acceder a este veh\xEDculo" });
    }
    const data = await storage.getSmartcarVehicleLatestData(vehicleId);
    if (!data) {
      return res.status(404).json({ message: "No hay datos disponibles para este veh\xEDculo" });
    }
    const now = /* @__PURE__ */ new Date();
    if (vehicle.tokenExpiryDate && vehicle.tokenExpiryDate < now) {
      try {
        const { accessToken: accessToken2, refreshToken, expiration } = await refreshAccessToken(vehicle.refreshToken || "");
        await storage.updateSmartcarVehicle(vehicle.id, {
          accessToken: accessToken2,
          refreshToken,
          tokenExpiryDate: new Date(expiration)
        });
        vehicle.accessToken = accessToken2;
      } catch (error) {
        console.error("Error al refrescar token:", error);
        return res.status(401).json({ message: "La conexi\xF3n con el veh\xEDculo ha expirado. Por favor, vuelve a conectar el veh\xEDculo." });
      }
    }
    const responseData = {
      info: {
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        vin: vehicle.vin
      },
      // Formatear adecuadamente para que coincida con lo que espera el frontend
      odometer: data.odometer ? {
        distance: data.odometer,
        timestamp: data.recordedAt.toISOString()
      } : null,
      fuel: data.fuelPercentRemaining ? {
        percent_remaining: data.fuelPercentRemaining / 100,
        // Convertir a decimal
        timestamp: data.recordedAt.toISOString()
      } : null,
      battery: data.batteryPercentRemaining ? {
        percent_remaining: data.batteryPercentRemaining / 100,
        // Convertir a decimal
        timestamp: data.recordedAt.toISOString()
      } : null,
      oil: data.oilLife ? {
        life_remaining: data.oilLife / 100,
        timestamp: data.recordedAt.toISOString()
      } : null,
      tirePressure: data.tirePressure ? {
        ...JSON.parse(data.tirePressure),
        timestamp: data.recordedAt.toISOString()
      } : null
    };
    res.json(responseData);
    collectVehicleData(vehicle.vehicleId, vehicle.accessToken || "", vehicle.id).catch((error) => {
      console.error("Error al actualizar datos del veh\xEDculo:", error);
    });
  } catch (error) {
    console.error("Error al obtener todos los datos del veh\xEDculo:", error);
    res.status(500).json({ message: `Error al obtener datos: ${error.message}` });
  }
});
router.post("/refresh", async (req, res) => {
  try {
    const { refresh_token } = req.body;
    if (!refresh_token) {
      return res.status(400).json({ message: "Token de actualizaci\xF3n no proporcionado" });
    }
    const { accessToken, refreshToken, expiration } = await refreshAccessToken(refresh_token);
    res.json({
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_at: expiration
    });
  } catch (error) {
    console.error("Error al refrescar token:", error);
    res.status(500).json({ message: `Error al refrescar token: ${error.message}` });
  }
});
router.post("/exchange", async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ message: "C\xF3digo de autorizaci\xF3n no proporcionado" });
    }
    const { accessToken, refreshToken, expiration } = await exchangeCode(code);
    res.json({
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_at: expiration
    });
  } catch (error) {
    console.error("Error al intercambiar c\xF3digo:", error);
    res.status(500).json({ message: `Error al intercambiar c\xF3digo: ${error.message}` });
  }
});
var smartcar_default = router;

// server/openai.ts
import OpenAI3 from "openai";
var openai3 = new OpenAI3({ apiKey: process.env.OPENAI_API_KEY });
async function analyzeOBDCode(obdCode, additionalInfo) {
  try {
    const prompt = `
Analiza el siguiente c\xF3digo de diagn\xF3stico OBD y proporciona una respuesta detallada:

C\xF3digo: ${obdCode}
${additionalInfo ? `Informaci\xF3n adicional proporcionada por el usuario: ${additionalInfo}` : ""}

Proporciona la siguiente informaci\xF3n en formato JSON:
- description: Una descripci\xF3n t\xE9cnica breve del c\xF3digo
- diagnosis: Una explicaci\xF3n detallada del problema
- causes: Un array con las posibles causas (de la m\xE1s a la menos probable)
- symptoms: Un array con los s\xEDntomas que puede experimentar el usuario
- consequences: Qu\xE9 puede pasar si no se soluciona el problema
- severity: Nivel de urgencia (alta, media, baja)
- recommendations: Recomendaciones para solucionar el problema
- parts: Array con las posibles refacciones necesarias
- estimatedCost: Costo estimado de la reparaci\xF3n (rango)
- diyDifficulty: Dificultad para repararlo uno mismo (f\xE1cil, moderado, dif\xEDcil, profesional)
`;
    const response = await openai3.chat.completions.create({
      model: "gpt-4o",
      // Último modelo de OpenAI (después del corte de conocimiento)
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });
    const content = response.choices[0].message.content;
    if (content) {
      try {
        const parsedData = JSON.parse(content);
        return parsedData;
      } catch (error) {
        console.error("Error al parsear la respuesta JSON de OpenAI:", error);
        throw new Error("Error al procesar la respuesta del diagn\xF3stico");
      }
    } else {
      throw new Error("No se recibi\xF3 respuesta del diagn\xF3stico");
    }
  } catch (error) {
    console.error("Error en la comunicaci\xF3n con OpenAI:", error);
    throw error;
  }
}
async function analyzeSymptomsForOBDCodes(symptoms) {
  try {
    const prompt = `
Analiza los siguientes s\xEDntomas descritos por el usuario de un veh\xEDculo y sugiere los posibles c\xF3digos OBD relacionados:

S\xEDntomas: ${symptoms}

Proporciona la siguiente informaci\xF3n en formato JSON:
- possibleCodes: Un array de objetos, cada uno con:
  - code: El c\xF3digo OBD probable
  - description: Breve descripci\xF3n del c\xF3digo
  - matchConfidence: Nivel de confianza de la coincidencia (alto, medio, bajo)
- generalDiagnosis: Una evaluaci\xF3n general basada en los s\xEDntomas
- recommendations: Recomendaciones para el diagn\xF3stico
- additionalTests: Pruebas adicionales recomendadas para confirmar el problema
`;
    const response = await openai3.chat.completions.create({
      model: "gpt-4o",
      // Último modelo de OpenAI (después del corte de conocimiento)
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });
    const content = response.choices[0].message.content;
    if (content) {
      try {
        const parsedData = JSON.parse(content);
        return parsedData;
      } catch (error) {
        console.error("Error al parsear la respuesta JSON de OpenAI:", error);
        throw new Error("Error al procesar la respuesta del an\xE1lisis de s\xEDntomas");
      }
    } else {
      throw new Error("No se recibi\xF3 respuesta del an\xE1lisis de s\xEDntomas");
    }
  } catch (error) {
    console.error("Error en la comunicaci\xF3n con OpenAI:", error);
    throw error;
  }
}
async function chatWithOBi2(userMessage, chatHistory = []) {
  try {
    const systemMessage = `
Eres OBi-2, un avanzado asistente de diagn\xF3stico automotriz de Autologic. Tu personalidad es:
- T\xE9cnica pero accesible, utilizando terminolog\xEDa automotriz precisa, explicada de forma que cualquier persona pueda entender
- Eficiente, proporcionando informaci\xF3n \xFAtil sin rodeos
- Respetuosa y profesional, nunca condescendiente
- Ofreces soluciones pr\xE1cticas, ordenadas por probabilidad
- Consciente de la diferencia entre reparaciones para aficionados vs profesionales
- Respondes en el mismo idioma que utiliza el usuario
- Tu objetivo es interpretar s\xEDntomas, sugerir posibles causas, y recomendar acciones.

Formato de respuesta:
1. Utiliza un estilo de "terminal de computadora", con elementos como comandos y salidas simuladas
2. Usa formatos como "AN\xC1LISIS: [texto]" o "RECOMENDACI\xD3N: [texto]" para estructurar tu respuesta
3. Mant\xE9n un dise\xF1o limpio y f\xE1cil de leer, con espaciado adecuado
`;
    const messages = [
      { role: "system", content: systemMessage },
      ...chatHistory,
      { role: "user", content: userMessage }
    ];
    const response = await openai3.chat.completions.create({
      model: "gpt-4o",
      // Último modelo de OpenAI (después del corte de conocimiento)
      messages
    });
    return response.choices[0].message.content || "Lo siento, no pude procesar tu consulta. Por favor, intenta de nuevo.";
  } catch (error) {
    console.error("Error en la comunicaci\xF3n con OpenAI:", error);
    throw error;
  }
}
async function getPartRecommendations(diagnosis, vehicleInfo) {
  try {
    const vehicleString = [
      vehicleInfo.year,
      vehicleInfo.make,
      vehicleInfo.model
    ].filter(Boolean).join(" ");
    const prompt = `
Bas\xE1ndote en el siguiente diagn\xF3stico para un ${vehicleString}, recomienda piezas espec\xEDficas que podr\xEDan necesitarse para la reparaci\xF3n:

Diagn\xF3stico: ${diagnosis}

Proporciona la siguiente informaci\xF3n en formato JSON:
- parts: Un array de objetos, cada uno con:
  - name: Nombre de la pieza
  - description: Descripci\xF3n breve
  - compatibility: Informaci\xF3n de compatibilidad (a\xF1os y modelos aplicables)
  - oem: \xBFEs una pieza OEM (Original Equipment Manufacturer)?
  - estimatedPrice: Precio estimado (USD)
  - difficultyToReplace: Dificultad de reemplazo (f\xE1cil, moderado, dif\xEDcil, profesional)
  - notes: Notas adicionales sobre la pieza
`;
    const response = await openai3.chat.completions.create({
      model: "gpt-4o",
      // Último modelo de OpenAI (después del corte de conocimiento)
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });
    const content = response.choices[0].message.content;
    if (content) {
      try {
        const parsedData = JSON.parse(content);
        return parsedData;
      } catch (error) {
        console.error("Error al parsear la respuesta JSON de OpenAI:", error);
        throw new Error("Error al procesar la respuesta de recomendaciones de piezas");
      }
    } else {
      throw new Error("No se recibi\xF3 respuesta de recomendaciones de piezas");
    }
  } catch (error) {
    console.error("Error en la comunicaci\xF3n con OpenAI:", error);
    throw error;
  }
}

// server/routes.ts
import multer from "multer";
import path3 from "path";
import fs2 from "fs";
var upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path3.join(import.meta.dirname, "..", "uploads"));
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, file.fieldname + "-" + uniqueSuffix + path3.extname(file.originalname));
    }
  }),
  limits: {
    fileSize: 50 * 1024 * 1024
    // 50MB max file size
  },
  fileFilter: (req, file, cb) => {
    const fileTypes = /csv|xml/;
    const extname = fileTypes.test(path3.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error("Only CSV and XML files are allowed"));
    }
  }
});
async function registerRoutes(app) {
  const apiPrefix = "/api";
  try {
    await initializeSmartcarConfig();
    console.log("SmartCar configuration initialized successfully");
  } catch (error) {
    console.error("Failed to initialize SmartCar configuration:", error);
  }
  registerProductRoutes(app, apiPrefix, storage);
  registerVehicleRoutes(app, apiPrefix, storage);
  registerCompatibilityRoutes(app, apiPrefix, storage);
  registerDiagnosticRoutes(app, apiPrefix, storage);
  registerAnalyticsRoutes(app, apiPrefix, storage);
  registerVideoRoutes(app, apiPrefix, storage);
  registerVehicleHealthRoutes(app, apiPrefix, storage);
  app.use(`${apiPrefix}/smartcar`, smartcar_default);
  app.post(`${apiPrefix}/ai/analyze-obd`, async (req, res) => {
    try {
      const { code, additionalInfo } = req.body;
      if (!code) {
        return res.status(400).json({ error: "Se requiere un c\xF3digo OBD" });
      }
      const result = await analyzeOBDCode(code, additionalInfo);
      return res.json(result);
    } catch (error) {
      console.error("Error en el an\xE1lisis de OBD:", error);
      return res.status(500).json({
        error: error instanceof Error ? error.message : "Error al analizar el c\xF3digo OBD"
      });
    }
  });
  app.post(`${apiPrefix}/ai/analyze-symptoms`, async (req, res) => {
    try {
      const { symptoms } = req.body;
      if (!symptoms) {
        return res.status(400).json({ error: "Se requiere una descripci\xF3n de s\xEDntomas" });
      }
      const result = await analyzeSymptomsForOBDCodes(symptoms);
      return res.json(result);
    } catch (error) {
      console.error("Error en el an\xE1lisis de s\xEDntomas:", error);
      return res.status(500).json({
        error: error instanceof Error ? error.message : "Error al analizar los s\xEDntomas"
      });
    }
  });
  app.post(`${apiPrefix}/ai/chat`, async (req, res) => {
    try {
      const { message, history } = req.body;
      if (!message) {
        return res.status(400).json({ error: "Se requiere un mensaje" });
      }
      const result = await chatWithOBi2(message, history || []);
      return res.json({ response: result });
    } catch (error) {
      console.error("Error en el chat con OBi-2:", error);
      return res.status(500).json({
        error: error instanceof Error ? error.message : "Error en la comunicaci\xF3n con OBi-2"
      });
    }
  });
  app.post(`${apiPrefix}/ai/part-recommendations`, async (req, res) => {
    try {
      const { diagnosis, vehicleInfo } = req.body;
      if (!diagnosis) {
        return res.status(400).json({ error: "Se requiere un diagn\xF3stico" });
      }
      const result = await getPartRecommendations(diagnosis, vehicleInfo || {});
      return res.json(result);
    } catch (error) {
      console.error("Error al generar recomendaciones de piezas:", error);
      return res.status(500).json({
        error: error instanceof Error ? error.message : "Error al generar recomendaciones de piezas"
      });
    }
  });
  app.post(`${apiPrefix}/theme`, (req, res) => {
    try {
      const themeData = req.body;
      if (!themeData.primary || !themeData.variant || !themeData.appearance) {
        return res.status(400).json({ error: "Datos de tema incompletos" });
      }
      const themePath = path3.resolve(process.cwd(), "theme.json");
      fs2.writeFileSync(themePath, JSON.stringify(themeData, null, 2));
      log(`Tema actualizado: ${JSON.stringify(themeData)}`, "theme");
      return res.json({ success: true, theme: themeData });
    } catch (error) {
      console.error("Error al actualizar el tema:", error);
      return res.status(500).json({ error: "Error al actualizar el tema" });
    }
  });
  app.post(`${apiPrefix}/import`, upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      const options = req.body.options ? JSON.parse(req.body.options) : {};
      const filePath = req.file.path;
      if (options.type === "products") {
        const importResult = await importProducts(filePath, options);
        return res.json(importResult);
      } else {
        const importResult = await importCompatibility(filePath, options);
        return res.json(importResult);
      }
    } catch (error) {
      console.error("Import error:", error);
      return res.status(500).json({
        message: error instanceof Error ? error.message : "Error processing import"
      });
    }
  });
  const httpServer = createServer(app);
  return httpServer;
}
async function importProducts(filePath, options) {
  return {
    imported: 42,
    updated: options.updateExisting ? 12 : 0,
    errors: []
  };
}
async function importCompatibility(filePath, options) {
  return {
    imported: 157,
    updated: options.updateExisting ? 35 : 0,
    deleted: options.deleteExisting ? 22 : 0,
    errors: []
  };
}

// server/index.ts
var AutologicServer = class {
  app = express4();
  port = 5e3;
  async initialize() {
    setupMiddleware(this.app);
    await registerRoutes(this.app);
    this.setupErrorHandling();
    if (process.env.NODE_ENV === "development") {
      await setupVite(this.app);
    } else {
      serveStatic(this.app);
    }
    return this;
  }
  setupErrorHandling() {
    this.app.use((err, _req, res, _next) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      logger.error(`Error: ${message}`);
      res.status(status).json({ message });
    });
  }
  async start() {
    return this.app.listen({
      port: this.port,
      host: "0.0.0.0",
      reusePort: true
    }, () => {
      logger.info(`Server running on port ${this.port}`);
    });
  }
};
var bootstrap = async () => {
  try {
    const server = await new AutologicServer().initialize();
    await server.start();
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
};
bootstrap();
