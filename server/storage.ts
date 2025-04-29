import {
  users, type User, type InsertUser,
  vehicles, type Vehicle, type InsertVehicle,
  products, type Product, type InsertProduct,
  compatibility, type Compatibility, type InsertCompatibility,
  categories, type Category, type InsertCategory,
  brands, type Brand, type InsertBrand,
  diagnostics, type Diagnostic, type InsertDiagnostic, type ChatMessage,
  videoTutorials, type VideoTutorial, type InsertVideoTutorial,
  videoCompatibility, type VideoCompatibility, type InsertVideoCompatibility,
  type ProductDetails, type VideoDetails,
  smartcarVehicles, type SmartcarVehicle, type InsertSmartcarVehicle,
  smartcarVehicleData, type SmartcarVehicleData, type InsertSmartcarVehicleData,
  smartcarConfig, type SmartcarConfig, type InsertSmartcarConfig
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, count, sql, like, ilike, or, isNull, not } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Vehicle methods
  getVehicles(filters: Partial<Vehicle>): Promise<Vehicle[]>;
  getVehicleById(id: number): Promise<Vehicle | undefined>;
  createVehicle(vehicle: InsertVehicle): Promise<Vehicle>;
  updateVehicle(id: number, vehicle: InsertVehicle): Promise<Vehicle | undefined>;
  deleteVehicle(id: number): Promise<boolean>;
  getUniqueVehicleValues(field: keyof Vehicle, filters: Partial<Vehicle>): Promise<any[]>;
  
  // Product methods
  getProducts(options: { 
    offset: number; 
    limit: number; 
    filters: any; 
    sortField: string;
    sortOrder: string;
  }): Promise<{ products: Product[]; total: number }>;
  getProductById(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: InsertProduct): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  getFeaturedProducts(): Promise<Product[]>;
  getRelatedProducts(productId: number): Promise<Product[]>;
  
  // Compatibility methods
  getCompatibilityRecords(filters: Partial<Compatibility>): Promise<Compatibility[]>;
  getCompatibilityById(id: number): Promise<Compatibility | undefined>;
  createCompatibility(compatibility: InsertCompatibility): Promise<Compatibility>;
  updateCompatibility(id: number, compatibility: InsertCompatibility): Promise<Compatibility | undefined>;
  deleteCompatibility(id: number): Promise<boolean>;
  createCompatibilityBatch(records: InsertCompatibility[]): Promise<{ success: number; errors: number }>;
  checkCompatibility(productId: number, vehicleId: number): Promise<boolean>;
  getCompatibleProducts(vehicleId: number): Promise<Product[]>;
  getCompatibleVehicles(productId: number): Promise<Vehicle[]>;
  
  // Category methods
  getCategories(): Promise<Category[]>;
  getPopularCategories(): Promise<Category[]>;
  
  // Brand methods
  getBrands(): Promise<Brand[]>;
  getPopularBrands(): Promise<Brand[]>;
  
  // Diagnostic methods
  getDiagnostics(userId: number): Promise<Diagnostic[]>;
  getDiagnosticById(id: number): Promise<Diagnostic | undefined>;
  createDiagnostic(diagnostic: InsertDiagnostic): Promise<Diagnostic>;
  updateDiagnostic(id: number, diagnostic: Partial<InsertDiagnostic>): Promise<Diagnostic | undefined>;
  deleteDiagnostic(id: number): Promise<boolean>;
  
  // Analytics methods
  // Compatibility analytics
  getCompatibilityAnalyticsByMake(timeRange: string): Promise<Array<{name: string; value: number}>>;
  getCompatibilityAnalyticsByYear(timeRange: string): Promise<Array<{name: string; value: number}>>;
  getCompatibilityAnalyticsByCategory(timeRange: string): Promise<Array<{name: string; value: number}>>;
  getCompatibilityTrends(timeRange: string): Promise<Array<{month: string; compatibles: number; incompatibles: number}>>;
  
  // Product analytics
  getTopCompatibleProducts(timeRange: string): Promise<Array<Product & {compatibilityCount: number}>>;
  getProductCategoryDistribution(timeRange: string): Promise<Array<{name: string; value: number}>>;
  getMostViewedProducts(timeRange: string): Promise<Array<Product & {viewCount: number}>>;
  getMostSearchedProducts(timeRange: string): Promise<Array<Product & {searchCount: number}>>;
  
  // Vehicle analytics
  getVehicleMakeDistribution(timeRange: string): Promise<Array<{name: string; value: number}>>;
  getVehicleYearDistribution(timeRange: string): Promise<Array<{name: string; value: number}>>;
  getMostCompatibleVehicles(timeRange: string): Promise<Array<Vehicle & {compatibilityCount: number}>>;
  getMostSearchedVehicles(timeRange: string): Promise<Array<Vehicle & {searchCount: number}>>;
  
  // Summary analytics
  getTotalProducts(): Promise<number>;
  getTotalVehicles(): Promise<number>;
  getTotalCompatibilityRecords(): Promise<number>;
  getAverageProductsPerVehicle(): Promise<number>;
  
  // Video tutorial methods
  getVideoTutorials(options: {
    offset: number;
    limit: number;
    filters?: {
      category?: string;
      difficultyLevel?: string;
      tags?: string[];
      vehicleId?: number;
      productId?: number;
    };
    sortField?: string;
    sortOrder?: string;
  }): Promise<{ videos: VideoTutorial[]; total: number }>;
  getVideoTutorialById(id: number): Promise<VideoTutorial | undefined>;
  createVideoTutorial(video: InsertVideoTutorial): Promise<VideoTutorial>;
  updateVideoTutorial(id: number, video: InsertVideoTutorial): Promise<VideoTutorial | undefined>;
  deleteVideoTutorial(id: number): Promise<boolean>;
  
  // Video compatibility methods
  createVideoCompatibility(record: InsertVideoCompatibility): Promise<VideoCompatibility>;
  getVideoCompatibilityRecords(filters: Partial<VideoCompatibility>): Promise<VideoCompatibility[]>;
  deleteVideoCompatibility(id: number): Promise<boolean>;
  
  // Specialized video tutorials methods
  getVideoTutorialsForVehicle(vehicleId: number): Promise<VideoTutorial[]>;
  getVideoTutorialsForProduct(productId: number): Promise<VideoTutorial[]>;
  getRelatedVideoTutorials(videoId: number): Promise<VideoTutorial[]>;
  getPopularVideoTutorials(): Promise<VideoTutorial[]>;
  getVideoTutorialDetails(videoId: number): Promise<VideoDetails | undefined>;

  // SmartCar methods
  getSmartcarConfig(): Promise<SmartcarConfig | undefined>;
  createSmartcarConfig(config: InsertSmartcarConfig): Promise<SmartcarConfig>;
  updateSmartcarConfig(id: number, config: Partial<SmartcarConfig>): Promise<SmartcarConfig | undefined>;
  
  // SmartCar vehicle methods
  getSmartcarVehicles(userId: number): Promise<SmartcarVehicle[]>;
  getSmartcarVehicleById(id: number): Promise<SmartcarVehicle | undefined>;
  createSmartcarVehicle(vehicle: InsertSmartcarVehicle): Promise<SmartcarVehicle>;
  updateSmartcarVehicle(id: number, vehicle: Partial<SmartcarVehicle>): Promise<SmartcarVehicle | undefined>;
  deleteSmartcarVehicle(id: number): Promise<boolean>;
  
  // SmartCar vehicle data methods
  getSmartcarVehicleData(vehicleId: number): Promise<SmartcarVehicleData[]>;
  getSmartcarVehicleLatestData(vehicleId: number): Promise<SmartcarVehicleData | undefined>;
  createSmartcarVehicleData(data: InsertSmartcarVehicleData): Promise<SmartcarVehicleData>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private vehicles: Map<number, Vehicle>;
  private products: Map<number, Product>;
  private compatibilityRecords: Map<number, Compatibility>;
  private categories: Map<number, Category>;
  private brands: Map<number, Brand>;
  private diagnostics: Map<number, Diagnostic>;
  private videoTutorials: Map<number, VideoTutorial>;
  private videoCompatibilityRecords: Map<number, VideoCompatibility>;
  private smartcarConfigs: Map<number, SmartcarConfig>;
  private smartcarVehicles: Map<number, SmartcarVehicle>;
  private smartcarVehicleData: Map<number, SmartcarVehicleData>;
  
  private userIdCounter: number;
  private vehicleIdCounter: number;
  private productIdCounter: number;
  private compatibilityIdCounter: number;
  private categoryIdCounter: number;
  private brandIdCounter: number;
  private diagnosticIdCounter: number;
  private videoTutorialIdCounter: number;
  private videoCompatibilityIdCounter: number;
  private smartcarConfigIdCounter: number;
  private smartcarVehicleIdCounter: number;
  private smartcarVehicleDataIdCounter: number;

  constructor() {
    // Initialize data stores
    this.users = new Map();
    this.vehicles = new Map();
    this.products = new Map();
    this.compatibilityRecords = new Map();
    this.categories = new Map();
    this.brands = new Map();
    this.diagnostics = new Map();
    this.videoTutorials = new Map();
    this.videoCompatibilityRecords = new Map();
    this.smartcarConfigs = new Map();
    this.smartcarVehicles = new Map();
    this.smartcarVehicleData = new Map();
    
    // Initialize ID counters
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
    
    // Initialize with some demo data
    this.initializeDemoData();
  }
  
  // Initialize with some demo data for testing
  private initializeDemoData() {
    // Add demo vehicles
    const demoVehicles: InsertVehicle[] = [
      { year: 2020, make: 'Toyota', model: 'Corolla', engine: '1.8L 4-Cylinder' },
      { year: 2019, make: 'Honda', model: 'Civic', engine: '2.0L 4-Cylinder' },
      { year: 2021, make: 'Ford', model: 'Mustang', engine: '5.0L V8' },
      { year: 2018, make: 'Chevrolet', model: 'Camaro', engine: '6.2L V8' },
      { year: 2022, make: 'Toyota', model: 'RAV4', engine: '2.5L 4-Cylinder' },
      { year: 2020, make: 'Honda', model: 'Accord', engine: '1.5L Turbo 4-Cylinder' },
      { year: 2021, make: 'Ford', model: 'F-150', engine: '3.5L EcoBoost V6' },
      { year: 2019, make: 'Chevrolet', model: 'Silverado', engine: '5.3L V8' },
      { year: 2022, make: 'Toyota', model: 'Camry', engine: '2.5L 4-Cylinder' },
      { year: 2021, make: 'Honda', model: 'CR-V', engine: '1.5L Turbo 4-Cylinder' }
    ];
    
    demoVehicles.forEach(vehicle => this.createVehicle(vehicle));
    
    // Add demo categories
    const demoCategories: InsertCategory[] = [
      { name: 'Filtros', count: 42 },
      { name: 'Frenos', count: 38 },
      { name: 'Suspensión', count: 35 },
      { name: 'Lubricantes', count: 30 },
      { name: 'Eléctricos', count: 28 },
      { name: 'Motor', count: 25 }
    ];
    
    demoCategories.forEach(category => {
      const id = this.categoryIdCounter++;
      this.categories.set(id, { ...category, id });
    });
    
    // Add demo brands
    const demoBrands: InsertBrand[] = [
      { name: 'Bosch', count: 45 },
      { name: 'NGK', count: 40 },
      { name: 'Brembo', count: 38 },
      { name: 'Monroe', count: 35 },
      { name: 'Fram', count: 32 },
      { name: 'Denso', count: 30 }
    ];
    
    demoBrands.forEach(brand => {
      const id = this.brandIdCounter++;
      this.brands.set(id, { ...brand, id });
    });
    
    // Add demo products
    const demoProducts: InsertProduct[] = [
      {
        sku: 'OIL-FILT-001',
        title: 'Filtro de Aceite Premium',
        description: 'Filtro de aceite de alta calidad para vehículos de pasajeros y camiones ligeros.',
        price: 9.99,
        brand: 'Bosch',
        category: 'Filtros',
        stock: 125,
        inStock: true,
        images: ['https://via.placeholder.com/300x300?text=Oil+Filter']
      },
      {
        sku: 'BRAKE-PAD-001',
        title: 'Pastillas de Freno Cerámicas',
        description: 'Pastillas de freno cerámicas para un rendimiento de frenado superior y menos polvo.',
        price: 49.99,
        brand: 'Brembo',
        category: 'Frenos',
        stock: 85,
        inStock: true,
        images: ['https://via.placeholder.com/300x300?text=Brake+Pads']
      },
      {
        sku: 'SPARK-PLUG-001',
        title: 'Bujía de Encendido Iridium',
        description: 'Bujías de iridio para un rendimiento y eficiencia de combustible mejorados.',
        price: 12.99,
        brand: 'NGK',
        category: 'Eléctricos',
        stock: 200,
        inStock: true,
        images: ['https://via.placeholder.com/300x300?text=Spark+Plug']
      },
      {
        sku: 'SHOCK-ABS-001',
        title: 'Amortiguador de Suspensión',
        description: 'Amortiguador de suspensión de calidad OEM para una conducción suave.',
        price: 79.99,
        brand: 'Monroe',
        category: 'Suspensión',
        stock: 45,
        inStock: true,
        images: ['https://via.placeholder.com/300x300?text=Shock+Absorber']
      },
      {
        sku: 'AIR-FILT-001',
        title: 'Filtro de Aire de Motor',
        description: 'Filtro de aire de motor de alto flujo para mejorar el rendimiento y la eficiencia.',
        price: 14.99,
        brand: 'Fram',
        category: 'Filtros',
        stock: 150,
        inStock: true,
        images: ['https://via.placeholder.com/300x300?text=Air+Filter']
      },
      {
        sku: 'OXY-SENS-001',
        title: 'Sensor de Oxígeno',
        description: 'Sensor de oxígeno de precisión para un control preciso de la relación aire-combustible.',
        price: 59.99,
        brand: 'Denso',
        category: 'Eléctricos',
        stock: 65,
        inStock: true,
        images: ['https://via.placeholder.com/300x300?text=Oxygen+Sensor']
      }
    ];
    
    demoProducts.forEach(product => this.createProduct(product));
    
    // Add demo compatibility records
    // Each product is compatible with several vehicles
    const vehicles = Array.from(this.vehicles.values());
    const products = Array.from(this.products.values());
    
    // Create compatibility records (each product compatible with 3-5 random vehicles)
    products.forEach(product => {
      // Shuffle and select random vehicles
      const shuffled = [...vehicles].sort(() => 0.5 - Math.random());
      const selectedVehicles = shuffled.slice(0, Math.floor(Math.random() * 3) + 3);
      
      selectedVehicles.forEach(vehicle => {
        const compatRecord: InsertCompatibility = {
          productId: product.id,
          vehicleId: vehicle.id,
          notes: 'Compatible con ajuste directo'
        };
        this.createCompatibility(compatRecord);
      });
    });
    
    // Add demo video tutorials
    const demoVideoTutorials: InsertVideoTutorial[] = [
      {
        title: 'Cómo cambiar el filtro de aceite de tu automóvil',
        description: 'Aprende cómo cambiar el filtro de aceite de tu automóvil de manera fácil y rápida. Este tutorial te guiará paso a paso en el proceso.',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        thumbnailUrl: 'https://via.placeholder.com/480x360?text=Cambio+de+Filtro+de+Aceite',
        duration: 720, // 12 minutos
        difficultyLevel: 'beginner',
        category: 'Mantenimiento',
        tags: ['filtro', 'aceite', 'cambio', 'mantenimiento']
      },
      {
        title: 'Guía completa para cambiar pastillas de freno',
        description: 'Tutorial detallado sobre cómo cambiar las pastillas de freno de tu vehículo. Aprende a identificar cuándo es necesario el cambio y cómo hacerlo correctamente.',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        thumbnailUrl: 'https://via.placeholder.com/480x360?text=Cambio+de+Pastillas+de+Freno',
        duration: 1080, // 18 minutos
        difficultyLevel: 'intermediate',
        category: 'Frenos',
        tags: ['frenos', 'pastillas', 'mantenimiento', 'seguridad']
      },
      {
        title: 'Solución de problemas comunes con bujías',
        description: 'Aprende a diagnosticar y resolver problemas comunes relacionados con las bujías. Este video incluye demostraciones de cómo probar, limpiar y reemplazar bujías.',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        thumbnailUrl: 'https://via.placeholder.com/480x360?text=Problemas+con+Bujías',
        duration: 840, // 14 minutos
        difficultyLevel: 'intermediate',
        category: 'Eléctricos',
        tags: ['bujías', 'diagnóstico', 'motor', 'encendido']
      },
      {
        title: 'Cómo reemplazar amortiguadores delanteros',
        description: 'Guía paso a paso para reemplazar los amortiguadores delanteros de tu vehículo. Aprende a reconocer cuándo es necesario reemplazarlos y cómo hacerlo correctamente.',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        thumbnailUrl: 'https://via.placeholder.com/480x360?text=Reemplazo+de+Amortiguadores',
        duration: 1320, // 22 minutos
        difficultyLevel: 'advanced',
        category: 'Suspensión',
        tags: ['amortiguadores', 'suspensión', 'reemplazo', 'reparación']
      },
      {
        title: 'Mantenimiento del filtro de aire: Cuándo y cómo cambiarlo',
        description: 'Descubre la importancia del filtro de aire para el rendimiento de tu vehículo. Este tutorial te muestra cómo inspeccionarlo, limpiarlo y reemplazarlo cuando sea necesario.',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        thumbnailUrl: 'https://via.placeholder.com/480x360?text=Mantenimiento+de+Filtro+de+Aire',
        duration: 600, // 10 minutos
        difficultyLevel: 'beginner',
        category: 'Mantenimiento',
        tags: ['filtro de aire', 'mantenimiento', 'rendimiento', 'motor']
      },
      {
        title: 'Diagnóstico y reemplazo de sensores de oxígeno',
        description: 'Aprende a diagnosticar problemas con los sensores de oxígeno y cómo reemplazarlos correctamente. Este video te guiará en el proceso completo.',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        thumbnailUrl: 'https://via.placeholder.com/480x360?text=Sensores+de+Oxígeno',
        duration: 900, // 15 minutos
        difficultyLevel: 'advanced',
        category: 'Eléctricos',
        tags: ['sensor', 'oxígeno', 'diagnóstico', 'emisiones']
      }
    ];
    
    // Create the video tutorials
    const createdVideos = demoVideoTutorials.map(video => this.createVideoTutorial(video));
    
    // Create video-product compatibility records
    const videoProductMappings = [
      { videoIndex: 0, productCategory: 'Filtros' }, // Filtro de aceite - Filtros
      { videoIndex: 1, productCategory: 'Frenos' }, // Pastillas de freno - Frenos
      { videoIndex: 2, productCategory: 'Eléctricos' }, // Bujías - Eléctricos
      { videoIndex: 3, productCategory: 'Suspensión' }, // Amortiguadores - Suspensión
      { videoIndex: 4, productCategory: 'Filtros' }, // Filtro de aire - Filtros
      { videoIndex: 5, productCategory: 'Eléctricos' } // Sensores de oxígeno - Eléctricos
    ];
    
    // Associate videos with related products
    videoProductMappings.forEach(mapping => {
      const video = createdVideos[mapping.videoIndex];
      const relatedProducts = products.filter(p => p.category === mapping.productCategory);
      
      relatedProducts.forEach(product => {
        const videoCompatibility: InsertVideoCompatibility = {
          videoId: video.id,
          productId: product.id,
          relevanceScore: Math.floor(Math.random() * 5) + 6 // Score between 6-10
        };
        this.createVideoCompatibility(videoCompatibility);
      });
    });
    
    // Associate videos with compatible vehicles (randomly)
    createdVideos.forEach(video => {
      // Select 3-5 random vehicles for each video
      const shuffledVehicles = [...vehicles].sort(() => 0.5 - Math.random());
      const selectedVehicles = shuffledVehicles.slice(0, Math.floor(Math.random() * 3) + 3);
      
      selectedVehicles.forEach(vehicle => {
        const videoCompatibility: InsertVideoCompatibility = {
          videoId: video.id,
          vehicleId: vehicle.id,
          relevanceScore: Math.floor(Math.random() * 5) + 6 // Score between 6-10
        };
        this.createVideoCompatibility(videoCompatibility);
      });
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Vehicle methods
  async getVehicles(filters: Partial<Vehicle>): Promise<Vehicle[]> {
    let results = Array.from(this.vehicles.values());
    
    // Apply filters
    if (filters.year) {
      results = results.filter(v => v.year === filters.year);
    }
    
    if (filters.make) {
      results = results.filter(v => v.make === filters.make);
    }
    
    if (filters.model) {
      results = results.filter(v => v.model === filters.model);
    }
    
    if (filters.engine) {
      results = results.filter(v => v.engine === filters.engine);
    }
    
    return results;
  }
  
  async getVehicleById(id: number): Promise<Vehicle | undefined> {
    return this.vehicles.get(id);
  }
  
  async createVehicle(vehicle: InsertVehicle): Promise<Vehicle> {
    const id = this.vehicleIdCounter++;
    const newVehicle: Vehicle = { ...vehicle, id };
    this.vehicles.set(id, newVehicle);
    return newVehicle;
  }
  
  async updateVehicle(id: number, vehicle: InsertVehicle): Promise<Vehicle | undefined> {
    const existingVehicle = this.vehicles.get(id);
    if (!existingVehicle) {
      return undefined;
    }
    
    const updatedVehicle: Vehicle = { ...vehicle, id };
    this.vehicles.set(id, updatedVehicle);
    return updatedVehicle;
  }
  
  async deleteVehicle(id: number): Promise<boolean> {
    return this.vehicles.delete(id);
  }
  
  async getUniqueVehicleValues(field: keyof Vehicle, filters: Partial<Vehicle>): Promise<any[]> {
    // Get vehicles with the applied filters
    const vehicles = await this.getVehicles(filters);
    
    // Extract unique values for the requested field
    const uniqueValues = new Set(vehicles.map(v => v[field]).filter(Boolean));
    
    // Convert to array and sort
    let results = Array.from(uniqueValues);
    
    // Sort numerically for year, alphabetically for others
    if (field === 'year') {
      results = results.sort((a, b) => Number(b) - Number(a)); // Descending for years
    } else {
      results = results.sort();
    }
    
    return results;
  }
  
  // Product methods
  async getProducts(options: { 
    offset: number; 
    limit: number; 
    filters: any; 
    sortField: string;
    sortOrder: string;
  }): Promise<{ products: Product[]; total: number }> {
    let results = Array.from(this.products.values());
    
    // Apply filters
    if (options.filters.categories?.length) {
      results = results.filter(p => options.filters.categories.includes(p.category));
    }
    
    if (options.filters.brands?.length) {
      results = results.filter(p => options.filters.brands.includes(p.brand));
    }
    
    if (options.filters.minPrice !== undefined) {
      results = results.filter(p => p.price >= options.filters.minPrice);
    }
    
    if (options.filters.maxPrice !== undefined) {
      results = results.filter(p => p.price <= options.filters.maxPrice);
    }
    
    if (options.filters.inStock !== undefined) {
      results = results.filter(p => p.inStock === options.filters.inStock);
    }
    
    // Apply vehicle compatibility filter if provided
    if (options.filters.vehicle) {
      const { year, make, model, engine } = options.filters.vehicle;
      
      // Find vehicles matching the criteria
      const matchingVehicles = await this.getVehicles({
        year,
        make,
        model,
        ...(engine ? { engine } : {})
      });
      
      // Get vehicle IDs
      const vehicleIds = matchingVehicles.map(v => v.id);
      
      // Find compatibility records for these vehicles
      const compatRecords = Array.from(this.compatibilityRecords.values())
        .filter(c => vehicleIds.includes(c.vehicleId));
      
      // Get product IDs compatible with these vehicles
      const compatProductIds = new Set(compatRecords.map(c => c.productId));
      
      // Filter products by compatibility
      results = results.filter(p => compatProductIds.has(p.id));
    }
    
    const total = results.length;
    
    // Sort results
    results = this.sortProducts(results, options.sortField, options.sortOrder);
    
    // Apply pagination
    results = results.slice(options.offset, options.offset + options.limit);
    
    return { products: results, total };
  }
  
  private sortProducts(products: Product[], field: string, order: string): Product[] {
    return [...products].sort((a, b) => {
      const aValue = a[field as keyof Product];
      const bValue = b[field as keyof Product];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return order === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return order === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      return 0;
    });
  }
  
  async getProductById(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }
  
  async createProduct(product: InsertProduct): Promise<Product> {
    const id = this.productIdCounter++;
    const newProduct: Product = { ...product, id };
    this.products.set(id, newProduct);
    return newProduct;
  }
  
  async updateProduct(id: number, product: InsertProduct): Promise<Product | undefined> {
    const existingProduct = this.products.get(id);
    if (!existingProduct) {
      return undefined;
    }
    
    const updatedProduct: Product = { ...product, id };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }
  
  async deleteProduct(id: number): Promise<boolean> {
    return this.products.delete(id);
  }
  
  async getFeaturedProducts(): Promise<Product[]> {
    // In a real implementation, this would select products based on some criteria
    // For demo, return a few random products
    const allProducts = Array.from(this.products.values());
    const shuffled = [...allProducts].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 4);
  }
  
  async getRelatedProducts(productId: number): Promise<Product[]> {
    const product = await this.getProductById(productId);
    if (!product) {
      return [];
    }
    
    // Find products in the same category
    const relatedProducts = Array.from(this.products.values())
      .filter(p => p.id !== productId && p.category === product.category)
      .slice(0, 4);
    
    return relatedProducts;
  }
  
  // Compatibility methods
  async getCompatibilityRecords(filters: Partial<Compatibility>): Promise<Compatibility[]> {
    let results = Array.from(this.compatibilityRecords.values());
    
    if (filters.productId !== undefined) {
      results = results.filter(c => c.productId === filters.productId);
    }
    
    if (filters.vehicleId !== undefined) {
      results = results.filter(c => c.vehicleId === filters.vehicleId);
    }
    
    return results;
  }
  
  async getCompatibilityById(id: number): Promise<Compatibility | undefined> {
    return this.compatibilityRecords.get(id);
  }
  
  async createCompatibility(compatibility: InsertCompatibility): Promise<Compatibility> {
    const id = this.compatibilityIdCounter++;
    const newCompatibility: Compatibility = { ...compatibility, id };
    this.compatibilityRecords.set(id, newCompatibility);
    return newCompatibility;
  }
  
  async updateCompatibility(id: number, compatibility: InsertCompatibility): Promise<Compatibility | undefined> {
    const existingCompatibility = this.compatibilityRecords.get(id);
    if (!existingCompatibility) {
      return undefined;
    }
    
    const updatedCompatibility: Compatibility = { ...compatibility, id };
    this.compatibilityRecords.set(id, updatedCompatibility);
    return updatedCompatibility;
  }
  
  async deleteCompatibility(id: number): Promise<boolean> {
    return this.compatibilityRecords.delete(id);
  }
  
  async createCompatibilityBatch(records: InsertCompatibility[]): Promise<{ success: number; errors: number }> {
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
  
  async checkCompatibility(productId: number, vehicleId: number): Promise<boolean> {
    const compatRecords = await this.getCompatibilityRecords({ productId, vehicleId });
    return compatRecords.length > 0;
  }
  
  async getCompatibleProducts(vehicleId: number): Promise<Product[]> {
    // Find compatibility records for this vehicle
    const compatRecords = await this.getCompatibilityRecords({ vehicleId });
    
    // Get product IDs
    const productIds = compatRecords.map(c => c.productId);
    
    // Find and return the products
    return productIds.map(id => this.products.get(id)).filter(Boolean) as Product[];
  }
  
  async getCompatibleVehicles(productId: number): Promise<Vehicle[]> {
    // Find compatibility records for this product
    const compatRecords = await this.getCompatibilityRecords({ productId });
    
    // Get vehicle IDs
    const vehicleIds = compatRecords.map(c => c.vehicleId);
    
    // Find and return the vehicles
    return vehicleIds.map(id => this.vehicles.get(id)).filter(Boolean) as Vehicle[];
  }
  
  // Category methods
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }
  
  async getPopularCategories(): Promise<Category[]> {
    // Sort by count descending and take the top 6
    return Array.from(this.categories.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }
  
  // Brand methods
  async getBrands(): Promise<Brand[]> {
    return Array.from(this.brands.values());
  }
  
  async getPopularBrands(): Promise<Brand[]> {
    // Sort by count descending and take the top 6
    return Array.from(this.brands.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }

  // Diagnostic methods
  async getDiagnostics(userId: number): Promise<Diagnostic[]> {
    const results = Array.from(this.diagnostics.values());
    if (userId) {
      return results.filter(d => d.userId === userId);
    }
    return results;
  }

  async getDiagnosticById(id: number): Promise<Diagnostic | undefined> {
    return this.diagnostics.get(id);
  }

  async createDiagnostic(diagnostic: InsertDiagnostic): Promise<Diagnostic> {
    const id = this.diagnosticIdCounter++;
    const now = new Date();
    const newDiagnostic: Diagnostic = { 
      ...diagnostic, 
      id,
      createdAt: now,
      updatedAt: now
    };
    this.diagnostics.set(id, newDiagnostic);
    return newDiagnostic;
  }

  async updateDiagnostic(id: number, diagnostic: Partial<InsertDiagnostic>): Promise<Diagnostic | undefined> {
    const existingDiagnostic = this.diagnostics.get(id);
    if (!existingDiagnostic) {
      return undefined;
    }
    
    const updatedDiagnostic: Diagnostic = { 
      ...existingDiagnostic, 
      ...diagnostic,
      updatedAt: new Date()
    };
    
    this.diagnostics.set(id, updatedDiagnostic);
    return updatedDiagnostic;
  }

  async deleteDiagnostic(id: number): Promise<boolean> {
    return this.diagnostics.delete(id);
  }
  
  // Analytics methods - Compatibility
  async getCompatibilityAnalyticsByMake(timeRange: string): Promise<Array<{name: string; value: number}>> {
    // En un caso real, filtrar por timeRange
    const vehicles = Array.from(this.vehicles.values());
    const compatibilities = Array.from(this.compatibilityRecords.values());
    
    // Agrupar vehículos compatibles por marca
    const makeCountMap = new Map<string, number>();
    
    compatibilities.forEach(compat => {
      const vehicle = this.vehicles.get(compat.vehicleId);
      if (vehicle) {
        const make = vehicle.make;
        makeCountMap.set(make, (makeCountMap.get(make) || 0) + 1);
      }
    });
    
    // Convertir a formato para gráficos
    return Array.from(makeCountMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Top 5
  }
  
  async getCompatibilityAnalyticsByYear(timeRange: string): Promise<Array<{name: string; value: number}>> {
    // En un caso real, filtrar por timeRange
    const vehicles = Array.from(this.vehicles.values());
    const compatibilities = Array.from(this.compatibilityRecords.values());
    
    // Agrupar vehículos compatibles por año
    const yearCountMap = new Map<string, number>();
    
    compatibilities.forEach(compat => {
      const vehicle = this.vehicles.get(compat.vehicleId);
      if (vehicle) {
        const year = vehicle.year.toString();
        yearCountMap.set(year, (yearCountMap.get(year) || 0) + 1);
      }
    });
    
    // Convertir a formato para gráficos
    return Array.from(yearCountMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }
  
  async getCompatibilityAnalyticsByCategory(timeRange: string): Promise<Array<{name: string; value: number}>> {
    // En un caso real, filtrar por timeRange
    const products = Array.from(this.products.values());
    const compatibilities = Array.from(this.compatibilityRecords.values());
    
    // Agrupar productos compatibles por categoría
    const categoryCountMap = new Map<string, number>();
    
    compatibilities.forEach(compat => {
      const product = this.products.get(compat.productId);
      if (product) {
        const category = product.category;
        categoryCountMap.set(category, (categoryCountMap.get(category) || 0) + 1);
      }
    });
    
    // Convertir a formato para gráficos
    return Array.from(categoryCountMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Top 5
  }
  
  async getCompatibilityTrends(timeRange: string): Promise<Array<{month: string; compatibles: number; incompatibles: number}>> {
    // Esta es una implementación simulada, 
    // en una aplicación real obtendríamos estos datos de las interacciones de los usuarios
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
    
    // Datos simulados para tendencias de compatibilidad
    return [
      { month: 'Ene', compatibles: 50, incompatibles: 15 },
      { month: 'Feb', compatibles: 55, incompatibles: 12 },
      { month: 'Mar', compatibles: 60, incompatibles: 18 },
      { month: 'Abr', compatibles: 58, incompatibles: 14 },
      { month: 'May', compatibles: 65, incompatibles: 16 },
      { month: 'Jun', compatibles: 70, incompatibles: 20 }
    ];
  }
  
  // Analytics methods - Products
  async getTopCompatibleProducts(timeRange: string): Promise<Array<Product & {compatibilityCount: number}>> {
    // En un caso real, filtrar por timeRange
    const products = Array.from(this.products.values());
    const compatibilities = Array.from(this.compatibilityRecords.values());
    
    // Contar compatibilidades por producto
    const productCompatMap = new Map<number, number>();
    
    compatibilities.forEach(compat => {
      productCompatMap.set(compat.productId, (productCompatMap.get(compat.productId) || 0) + 1);
    });
    
    // Agregar el conteo a los productos
    const productsWithCounts = products.map(product => ({
      ...product,
      compatibilityCount: productCompatMap.get(product.id) || 0
    }));
    
    // Ordenar por cantidad de compatibilidades (descendente)
    return productsWithCounts
      .sort((a, b) => b.compatibilityCount - a.compatibilityCount)
      .slice(0, 10); // Top 10
  }
  
  async getProductCategoryDistribution(timeRange: string): Promise<Array<{name: string; value: number}>> {
    // En un caso real, filtrar por timeRange
    const products = Array.from(this.products.values());
    
    // Agrupar productos por categoría
    const categoryCountMap = new Map<string, number>();
    
    products.forEach(product => {
      const category = product.category;
      categoryCountMap.set(category, (categoryCountMap.get(category) || 0) + 1);
    });
    
    // Convertir a formato para gráficos
    return Array.from(categoryCountMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }
  
  async getMostViewedProducts(timeRange: string): Promise<Array<Product & {viewCount: number}>> {
    // Esta es una implementación simulada, 
    // en una aplicación real obtendríamos estos datos de análisis de comportamiento del usuario
    const products = Array.from(this.products.values());
    
    // Simular conteos de vistas (aleatorios)
    return products.map(product => ({
      ...product,
      viewCount: Math.floor(Math.random() * 1000) // Simular vistas
    }))
    .sort((a, b) => b.viewCount - a.viewCount)
    .slice(0, 10); // Top 10
  }
  
  async getMostSearchedProducts(timeRange: string): Promise<Array<Product & {searchCount: number}>> {
    // Esta es una implementación simulada, 
    // en una aplicación real obtendríamos estos datos de análisis de comportamiento del usuario
    const products = Array.from(this.products.values());
    
    // Simular conteos de búsquedas (aleatorios)
    return products.map(product => ({
      ...product,
      searchCount: Math.floor(Math.random() * 500) // Simular búsquedas
    }))
    .sort((a, b) => b.searchCount - a.searchCount)
    .slice(0, 10); // Top 10
  }
  
  // Analytics methods - Vehicles
  async getVehicleMakeDistribution(timeRange: string): Promise<Array<{name: string; value: number}>> {
    // En un caso real, filtrar por timeRange
    const vehicles = Array.from(this.vehicles.values());
    
    // Agrupar vehículos por marca
    const makeCountMap = new Map<string, number>();
    
    vehicles.forEach(vehicle => {
      const make = vehicle.make;
      makeCountMap.set(make, (makeCountMap.get(make) || 0) + 1);
    });
    
    // Convertir a formato para gráficos
    return Array.from(makeCountMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }
  
  async getVehicleYearDistribution(timeRange: string): Promise<Array<{name: string; value: number}>> {
    // En un caso real, filtrar por timeRange
    const vehicles = Array.from(this.vehicles.values());
    
    // Agrupar vehículos por año
    const yearCountMap = new Map<string, number>();
    
    vehicles.forEach(vehicle => {
      const year = vehicle.year.toString();
      yearCountMap.set(year, (yearCountMap.get(year) || 0) + 1);
    });
    
    // Convertir a formato para gráficos
    return Array.from(yearCountMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => Number(a.name) - Number(b.name)); // Ordenar años cronológicamente
  }
  
  async getMostCompatibleVehicles(timeRange: string): Promise<Array<Vehicle & {compatibilityCount: number}>> {
    // En un caso real, filtrar por timeRange
    const vehicles = Array.from(this.vehicles.values());
    const compatibilities = Array.from(this.compatibilityRecords.values());
    
    // Contar compatibilidades por vehículo
    const vehicleCompatMap = new Map<number, number>();
    
    compatibilities.forEach(compat => {
      vehicleCompatMap.set(compat.vehicleId, (vehicleCompatMap.get(compat.vehicleId) || 0) + 1);
    });
    
    // Agregar el conteo a los vehículos
    const vehiclesWithCounts = vehicles.map(vehicle => ({
      ...vehicle,
      compatibilityCount: vehicleCompatMap.get(vehicle.id) || 0
    }));
    
    // Ordenar por cantidad de compatibilidades (descendente)
    return vehiclesWithCounts
      .sort((a, b) => b.compatibilityCount - a.compatibilityCount)
      .slice(0, 10); // Top 10
  }
  
  async getMostSearchedVehicles(timeRange: string): Promise<Array<Vehicle & {searchCount: number}>> {
    // Esta es una implementación simulada, 
    // en una aplicación real obtendríamos estos datos de análisis de comportamiento del usuario
    const vehicles = Array.from(this.vehicles.values());
    
    // Simular conteos de búsquedas (aleatorios)
    return vehicles.map(vehicle => ({
      ...vehicle,
      searchCount: Math.floor(Math.random() * 300) // Simular búsquedas
    }))
    .sort((a, b) => b.searchCount - a.searchCount)
    .slice(0, 10); // Top 10
  }
  
  // Analytics methods - Summary
  async getTotalProducts(): Promise<number> {
    return this.products.size;
  }
  
  async getTotalVehicles(): Promise<number> {
    return this.vehicles.size;
  }
  
  async getTotalCompatibilityRecords(): Promise<number> {
    return this.compatibilityRecords.size;
  }
  
  async getAverageProductsPerVehicle(): Promise<number> {
    const vehicles = Array.from(this.vehicles.values());
    const compatibilities = Array.from(this.compatibilityRecords.values());
    
    // Contar productos compatibles por vehículo
    const vehicleProductsMap = new Map<number, Set<number>>();
    
    compatibilities.forEach(compat => {
      if (!vehicleProductsMap.has(compat.vehicleId)) {
        vehicleProductsMap.set(compat.vehicleId, new Set());
      }
      vehicleProductsMap.get(compat.vehicleId)?.add(compat.productId);
    });
    
    // Calcular el promedio
    const productCounts = Array.from(vehicleProductsMap.values()).map(set => set.size);
    const totalProductCount = productCounts.reduce((sum, count) => sum + count, 0);
    
    return vehicles.length > 0 ? totalProductCount / vehicles.length : 0;
  }
  
  // Video tutorial methods
  async getVideoTutorials(options: {
    offset: number;
    limit: number;
    filters?: {
      category?: string;
      difficultyLevel?: string;
      tags?: string[];
      vehicleId?: number;
      productId?: number;
    };
    sortField?: string;
    sortOrder?: string;
  }): Promise<{ videos: VideoTutorial[]; total: number }> {
    let results = Array.from(this.videoTutorials.values());
    
    // Apply filters
    if (options.filters) {
      if (options.filters.category) {
        results = results.filter(v => v.category === options.filters!.category);
      }
      
      if (options.filters.difficultyLevel) {
        results = results.filter(v => v.difficultyLevel === options.filters!.difficultyLevel);
      }
      
      if (options.filters.tags && options.filters.tags.length > 0) {
        results = results.filter(v => 
          options.filters!.tags!.some(tag => v.tags.includes(tag))
        );
      }
      
      // Filter by vehicle compatibility
      if (options.filters.vehicleId) {
        const vehicleCompatRecords = Array.from(this.videoCompatibilityRecords.values())
          .filter(vc => vc.vehicleId === options.filters!.vehicleId);
        
        const compatVideoIds = new Set(vehicleCompatRecords.map(vc => vc.videoId));
        results = results.filter(v => compatVideoIds.has(v.id));
      }
      
      // Filter by product compatibility
      if (options.filters.productId) {
        const productCompatRecords = Array.from(this.videoCompatibilityRecords.values())
          .filter(vc => vc.productId === options.filters!.productId);
        
        const compatVideoIds = new Set(productCompatRecords.map(vc => vc.videoId));
        results = results.filter(v => compatVideoIds.has(v.id));
      }
    }
    
    const total = results.length;
    
    // Sort videos
    if (options.sortField && options.sortOrder) {
      results = this.sortVideoTutorials(results, options.sortField, options.sortOrder);
    } else {
      // Default sorting by most recent
      results = results.sort((a, b) => {
        const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bDate - aDate; // Most recent first
      });
    }
    
    // Apply pagination
    results = results.slice(options.offset, options.offset + options.limit);
    
    return { videos: results, total };
  }
  
  private sortVideoTutorials(videos: VideoTutorial[], field: string, order: string): VideoTutorial[] {
    return [...videos].sort((a, b) => {
      const aValue = a[field as keyof VideoTutorial];
      const bValue = b[field as keyof VideoTutorial];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return order === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return order === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      return 0;
    });
  }
  
  async getVideoTutorialById(id: number): Promise<VideoTutorial | undefined> {
    return this.videoTutorials.get(id);
  }
  
  async createVideoTutorial(video: InsertVideoTutorial): Promise<VideoTutorial> {
    const id = this.videoTutorialIdCounter++;
    const newVideoTutorial: VideoTutorial = { ...video, id };
    this.videoTutorials.set(id, newVideoTutorial);
    return newVideoTutorial;
  }
  
  async updateVideoTutorial(id: number, video: InsertVideoTutorial): Promise<VideoTutorial | undefined> {
    const existingVideo = this.videoTutorials.get(id);
    if (!existingVideo) {
      return undefined;
    }
    
    const updatedVideo: VideoTutorial = { ...video, id };
    this.videoTutorials.set(id, updatedVideo);
    return updatedVideo;
  }
  
  async deleteVideoTutorial(id: number): Promise<boolean> {
    // Remove all compatibility records for this video
    const videoCompatRecords = Array.from(this.videoCompatibilityRecords.values())
      .filter(vc => vc.videoId === id);
    
    videoCompatRecords.forEach(vc => {
      this.videoCompatibilityRecords.delete(vc.id);
    });
    
    // Delete the video
    return this.videoTutorials.delete(id);
  }
  
  // Video compatibility methods
  async createVideoCompatibility(record: InsertVideoCompatibility): Promise<VideoCompatibility> {
    const id = this.videoCompatibilityIdCounter++;
    const newVideoCompatibility: VideoCompatibility = { ...record, id };
    this.videoCompatibilityRecords.set(id, newVideoCompatibility);
    return newVideoCompatibility;
  }
  
  async getVideoCompatibilityRecords(filters: Partial<VideoCompatibility>): Promise<VideoCompatibility[]> {
    let results = Array.from(this.videoCompatibilityRecords.values());
    
    if (filters.videoId !== undefined) {
      results = results.filter(vc => vc.videoId === filters.videoId);
    }
    
    if (filters.vehicleId !== undefined) {
      results = results.filter(vc => vc.vehicleId === filters.vehicleId);
    }
    
    if (filters.productId !== undefined) {
      results = results.filter(vc => vc.productId === filters.productId);
    }
    
    return results;
  }
  
  async deleteVideoCompatibility(id: number): Promise<boolean> {
    return this.videoCompatibilityRecords.delete(id);
  }
  
  // Specialized video tutorials methods
  async getVideoTutorialsForVehicle(vehicleId: number): Promise<VideoTutorial[]> {
    const vehicleCompatRecords = await this.getVideoCompatibilityRecords({ vehicleId });
    const videoIds = vehicleCompatRecords.map(vc => vc.videoId);
    return videoIds.map(id => this.videoTutorials.get(id)).filter(Boolean) as VideoTutorial[];
  }
  
  async getVideoTutorialsForProduct(productId: number): Promise<VideoTutorial[]> {
    const productCompatRecords = await this.getVideoCompatibilityRecords({ productId });
    const videoIds = productCompatRecords.map(vc => vc.videoId);
    return videoIds.map(id => this.videoTutorials.get(id)).filter(Boolean) as VideoTutorial[];
  }
  
  async getRelatedVideoTutorials(videoId: number): Promise<VideoTutorial[]> {
    const video = await this.getVideoTutorialById(videoId);
    if (!video) {
      return [];
    }
    
    // Find videos in the same category
    const relatedVideos = Array.from(this.videoTutorials.values())
      .filter(v => v.id !== videoId && v.category === video.category)
      .slice(0, 4);
    
    return relatedVideos;
  }
  
  async getPopularVideoTutorials(): Promise<VideoTutorial[]> {
    // In a real implementation, this would return videos based on view count or ratings
    // For demo purposes, just return a few random videos
    const allVideos = Array.from(this.videoTutorials.values());
    const shuffled = [...allVideos].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 4);
  }
  
  async getVideoTutorialDetails(videoId: number): Promise<VideoDetails | undefined> {
    const video = await this.getVideoTutorialById(videoId);
    if (!video) {
      return undefined;
    }
    
    // Get related products
    const productCompatRecords = await this.getVideoCompatibilityRecords({ videoId });
    const productIds = productCompatRecords
      .filter(vc => vc.productId !== undefined)
      .map(vc => vc.productId as number);
    
    const relatedProducts = productIds
      .map(id => this.products.get(id))
      .filter(Boolean)
      .map(product => ({
        id: product!.id,
        title: product!.title,
        brand: product!.brand,
        thumbnailUrl: product!.images[0] || undefined
      }));
    
    // Get compatible vehicles
    const vehicleCompatRecords = await this.getVideoCompatibilityRecords({ videoId });
    const vehicleIds = vehicleCompatRecords
      .filter(vc => vc.vehicleId !== undefined)
      .map(vc => vc.vehicleId as number);
    
    const compatibleVehicles = vehicleIds
      .map(id => this.vehicles.get(id))
      .filter(Boolean)
      .map(vehicle => ({
        year: vehicle!.year,
        make: vehicle!.make,
        model: vehicle!.model,
        engine: vehicle!.engine || undefined
      }));
    
    // Combine the data into a VideoDetails object
    const videoDetails: VideoDetails = {
      id: video.id,
      title: video.title,
      description: video.description,
      videoUrl: video.videoUrl,
      thumbnailUrl: video.thumbnailUrl,
      duration: video.duration,
      difficultyLevel: video.difficultyLevel,
      category: video.category,
      tags: video.tags,
      relatedProducts: relatedProducts.length > 0 ? relatedProducts : undefined,
      compatibleVehicles: compatibleVehicles.length > 0 ? compatibleVehicles : undefined
    };
    
    return videoDetails;
  }
}

// Implementación del almacenamiento usando la base de datos PostgreSQL
export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }
  
  // Vehicle methods
  async getVehicles(filters: Partial<Vehicle>): Promise<Vehicle[]> {
    let query = db.select().from(vehicles);
    
    if (filters.id !== undefined) {
      query = query.where(eq(vehicles.id, filters.id));
    }
    
    if (filters.year !== undefined) {
      query = query.where(eq(vehicles.year, filters.year));
    }
    
    if (filters.make !== undefined) {
      query = query.where(eq(vehicles.make, filters.make));
    }
    
    if (filters.model !== undefined) {
      query = query.where(eq(vehicles.model, filters.model));
    }
    
    if (filters.engine !== undefined) {
      query = query.where(eq(vehicles.engine, filters.engine));
    }

    if (filters.isImported !== undefined) {
      query = query.where(eq(vehicles.isImported, filters.isImported));
    }

    if (filters.originCountry !== undefined) {
      query = query.where(eq(vehicles.originCountry, filters.originCountry));
    }
    
    return query;
  }

  async getVehicleById(id: number): Promise<Vehicle | undefined> {
    const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.id, id));
    return vehicle || undefined;
  }

  async createVehicle(vehicle: InsertVehicle): Promise<Vehicle> {
    const [newVehicle] = await db.insert(vehicles).values(vehicle).returning();
    return newVehicle;
  }

  async updateVehicle(id: number, vehicle: InsertVehicle): Promise<Vehicle | undefined> {
    const [updatedVehicle] = await db.update(vehicles).set(vehicle).where(eq(vehicles.id, id)).returning();
    return updatedVehicle || undefined;
  }

  async deleteVehicle(id: number): Promise<boolean> {
    const result = await db.delete(vehicles).where(eq(vehicles.id, id));
    return result.rowCount > 0;
  }

  async getUniqueVehicleValues(field: keyof Vehicle, filters: Partial<Vehicle>): Promise<any[]> {
    // Primero filtramos los vehículos según los criterios
    const vehiclesList = await this.getVehicles(filters);

    // Luego extraemos los valores únicos para el campo solicitado
    const uniqueValues = new Set(vehiclesList.map(v => v[field]).filter(Boolean));
    
    // Convertimos a array y ordenamos
    let results = Array.from(uniqueValues);
    
    // Ordenamos por año de forma descendente o alfabéticamente para otros campos
    if (field === 'year') {
      results = results.sort((a, b) => Number(b) - Number(a)); // Descendente para años
    } else {
      results = results.sort();
    }
    
    return results;
  }

  // Implementamos los métodos restantes usando MemStorage por ahora
  // Esto permite una migración gradual a la base de datos
  private memStorage = new MemStorage();

  // Product methods
  async getProducts(options: { offset: number; limit: number; filters: any; sortField: string; sortOrder: string; }): Promise<{ products: Product[]; total: number; }> {
    return this.memStorage.getProducts(options);
  }

  async getProductById(id: number): Promise<Product | undefined> {
    return this.memStorage.getProductById(id);
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    return this.memStorage.createProduct(product);
  }

  async updateProduct(id: number, product: InsertProduct): Promise<Product | undefined> {
    return this.memStorage.updateProduct(id, product);
  }

  async deleteProduct(id: number): Promise<boolean> {
    return this.memStorage.deleteProduct(id);
  }

  async getFeaturedProducts(): Promise<Product[]> {
    return this.memStorage.getFeaturedProducts();
  }

  async getRelatedProducts(productId: number): Promise<Product[]> {
    return this.memStorage.getRelatedProducts(productId);
  }

  // Compatibility methods
  async getCompatibilityRecords(filters: Partial<Compatibility>): Promise<Compatibility[]> {
    return this.memStorage.getCompatibilityRecords(filters);
  }

  async getCompatibilityById(id: number): Promise<Compatibility | undefined> {
    return this.memStorage.getCompatibilityById(id);
  }

  async createCompatibility(compatibility: InsertCompatibility): Promise<Compatibility> {
    return this.memStorage.createCompatibility(compatibility);
  }

  async updateCompatibility(id: number, compatibility: InsertCompatibility): Promise<Compatibility | undefined> {
    return this.memStorage.updateCompatibility(id, compatibility);
  }

  async deleteCompatibility(id: number): Promise<boolean> {
    return this.memStorage.deleteCompatibility(id);
  }

  async createCompatibilityBatch(records: InsertCompatibility[]): Promise<{ success: number; errors: number; }> {
    return this.memStorage.createCompatibilityBatch(records);
  }

  async checkCompatibility(productId: number, vehicleId: number): Promise<boolean> {
    return this.memStorage.checkCompatibility(productId, vehicleId);
  }

  async getCompatibleProducts(vehicleId: number): Promise<Product[]> {
    return this.memStorage.getCompatibleProducts(vehicleId);
  }

  async getCompatibleVehicles(productId: number): Promise<Vehicle[]> {
    return this.memStorage.getCompatibleVehicles(productId);
  }

  // Category methods
  async getCategories(): Promise<Category[]> {
    return this.memStorage.getCategories();
  }

  async getPopularCategories(): Promise<Category[]> {
    return this.memStorage.getPopularCategories();
  }

  // Brand methods
  async getBrands(): Promise<Brand[]> {
    return this.memStorage.getBrands();
  }

  async getPopularBrands(): Promise<Brand[]> {
    return this.memStorage.getPopularBrands();
  }

  // Diagnostic methods
  async getDiagnostics(userId: number): Promise<Diagnostic[]> {
    return this.memStorage.getDiagnostics(userId);
  }

  async getDiagnosticById(id: number): Promise<Diagnostic | undefined> {
    return this.memStorage.getDiagnosticById(id);
  }

  async createDiagnostic(diagnostic: InsertDiagnostic): Promise<Diagnostic> {
    return this.memStorage.createDiagnostic(diagnostic);
  }

  async updateDiagnostic(id: number, diagnostic: Partial<InsertDiagnostic>): Promise<Diagnostic | undefined> {
    return this.memStorage.updateDiagnostic(id, diagnostic);
  }

  async deleteDiagnostic(id: number): Promise<boolean> {
    return this.memStorage.deleteDiagnostic(id);
  }

  // Analytics methods
  async getCompatibilityAnalyticsByMake(timeRange: string): Promise<Array<{ name: string; value: number; }>> {
    return this.memStorage.getCompatibilityAnalyticsByMake(timeRange);
  }

  async getCompatibilityAnalyticsByYear(timeRange: string): Promise<Array<{ name: string; value: number; }>> {
    return this.memStorage.getCompatibilityAnalyticsByYear(timeRange);
  }

  async getCompatibilityAnalyticsByCategory(timeRange: string): Promise<Array<{ name: string; value: number; }>> {
    return this.memStorage.getCompatibilityAnalyticsByCategory(timeRange);
  }

  async getCompatibilityTrends(timeRange: string): Promise<Array<{ month: string; compatibles: number; incompatibles: number; }>> {
    return this.memStorage.getCompatibilityTrends(timeRange);
  }

  async getTopCompatibleProducts(timeRange: string): Promise<Array<Product & { compatibilityCount: number; }>> {
    return this.memStorage.getTopCompatibleProducts(timeRange);
  }

  async getProductCategoryDistribution(timeRange: string): Promise<Array<{ name: string; value: number; }>> {
    return this.memStorage.getProductCategoryDistribution(timeRange);
  }

  async getMostViewedProducts(timeRange: string): Promise<Array<Product & { viewCount: number; }>> {
    return this.memStorage.getMostViewedProducts(timeRange);
  }

  async getMostSearchedProducts(timeRange: string): Promise<Array<Product & { searchCount: number; }>> {
    return this.memStorage.getMostSearchedProducts(timeRange);
  }

  async getVehicleMakeDistribution(timeRange: string): Promise<Array<{ name: string; value: number; }>> {
    return this.memStorage.getVehicleMakeDistribution(timeRange);
  }

  async getVehicleYearDistribution(timeRange: string): Promise<Array<{ name: string; value: number; }>> {
    return this.memStorage.getVehicleYearDistribution(timeRange);
  }

  async getMostCompatibleVehicles(timeRange: string): Promise<Array<Vehicle & { compatibilityCount: number; }>> {
    return this.memStorage.getMostCompatibleVehicles(timeRange);
  }

  async getMostSearchedVehicles(timeRange: string): Promise<Array<Vehicle & { searchCount: number; }>> {
    return this.memStorage.getMostSearchedVehicles(timeRange);
  }

  async getTotalProducts(): Promise<number> {
    return this.memStorage.getTotalProducts();
  }

  async getTotalVehicles(): Promise<number> {
    return this.memStorage.getTotalVehicles();
  }

  async getTotalCompatibilityRecords(): Promise<number> {
    return this.memStorage.getTotalCompatibilityRecords();
  }

  async getAverageProductsPerVehicle(): Promise<number> {
    return this.memStorage.getAverageProductsPerVehicle();
  }

  // Video tutorial methods
  async getVideoTutorials(options: { offset: number; limit: number; filters?: { category?: string; difficultyLevel?: string; tags?: string[]; vehicleId?: number; productId?: number; }; sortField?: string; sortOrder?: string; }): Promise<{ videos: VideoTutorial[]; total: number; }> {
    return this.memStorage.getVideoTutorials(options);
  }

  async getVideoTutorialById(id: number): Promise<VideoTutorial | undefined> {
    return this.memStorage.getVideoTutorialById(id);
  }

  async createVideoTutorial(video: InsertVideoTutorial): Promise<VideoTutorial> {
    return this.memStorage.createVideoTutorial(video);
  }

  async updateVideoTutorial(id: number, video: InsertVideoTutorial): Promise<VideoTutorial | undefined> {
    return this.memStorage.updateVideoTutorial(id, video);
  }

  async deleteVideoTutorial(id: number): Promise<boolean> {
    return this.memStorage.deleteVideoTutorial(id);
  }

  async createVideoCompatibility(record: InsertVideoCompatibility): Promise<VideoCompatibility> {
    return this.memStorage.createVideoCompatibility(record);
  }

  async getVideoCompatibilityRecords(filters: Partial<VideoCompatibility>): Promise<VideoCompatibility[]> {
    return this.memStorage.getVideoCompatibilityRecords(filters);
  }

  async deleteVideoCompatibility(id: number): Promise<boolean> {
    return this.memStorage.deleteVideoCompatibility(id);
  }

  async getVideoTutorialsForVehicle(vehicleId: number): Promise<VideoTutorial[]> {
    return this.memStorage.getVideoTutorialsForVehicle(vehicleId);
  }

  async getVideoTutorialsForProduct(productId: number): Promise<VideoTutorial[]> {
    return this.memStorage.getVideoTutorialsForProduct(productId);
  }

  async getRelatedVideoTutorials(videoId: number): Promise<VideoTutorial[]> {
    return this.memStorage.getRelatedVideoTutorials(videoId);
  }

  async getPopularVideoTutorials(): Promise<VideoTutorial[]> {
    return this.memStorage.getPopularVideoTutorials();
  }

  async getVideoTutorialDetails(videoId: number): Promise<VideoDetails | undefined> {
    return this.memStorage.getVideoTutorialDetails(videoId);
  }

  // SmartCar methods
  async getSmartcarConfig(): Promise<SmartcarConfig | undefined> {
    const configs = await db.select().from(smartcarConfig);
    return configs.length > 0 ? configs[0] : undefined;
  }

  async createSmartcarConfig(config: InsertSmartcarConfig): Promise<SmartcarConfig> {
    const [inserted] = await db.insert(smartcarConfig)
      .values({
        ...config,
        isActive: true
      })
      .returning();
    return inserted;
  }

  async updateSmartcarConfig(id: number, config: Partial<SmartcarConfig>): Promise<SmartcarConfig | undefined> {
    const [updated] = await db.update(smartcarConfig)
      .set({
        ...config,
        updatedAt: new Date()
      })
      .where(eq(smartcarConfig.id, id))
      .returning();
    return updated;
  }
  
  // SmartCar vehicle methods
  async getSmartcarVehicles(userId: number): Promise<SmartcarVehicle[]> {
    const vehicles = await db.select()
      .from(smartcarVehicles)
      .where(eq(smartcarVehicles.userId, userId));
    return vehicles;
  }

  async getSmartcarVehicleById(id: number): Promise<SmartcarVehicle | undefined> {
    const [vehicle] = await db.select()
      .from(smartcarVehicles)
      .where(eq(smartcarVehicles.id, id));
    return vehicle;
  }

  async createSmartcarVehicle(vehicle: InsertSmartcarVehicle): Promise<SmartcarVehicle> {
    const [inserted] = await db.insert(smartcarVehicles)
      .values(vehicle)
      .returning();
    return inserted;
  }

  async updateSmartcarVehicle(id: number, vehicle: Partial<SmartcarVehicle>): Promise<SmartcarVehicle | undefined> {
    const [updated] = await db.update(smartcarVehicles)
      .set({
        ...vehicle,
        updatedAt: new Date()
      })
      .where(eq(smartcarVehicles.id, id))
      .returning();
    return updated;
  }

  async deleteSmartcarVehicle(id: number): Promise<boolean> {
    // First delete all related data
    await db.delete(smartcarVehicleData)
      .where(eq(smartcarVehicleData.smartcarVehicleId, id));
    
    // Then delete the vehicle
    const result = await db.delete(smartcarVehicles)
      .where(eq(smartcarVehicles.id, id));
      
    return result.rowCount > 0;
  }
  
  // SmartCar vehicle data methods
  async getSmartcarVehicleData(vehicleId: number): Promise<SmartcarVehicleData[]> {
    const data = await db.select()
      .from(smartcarVehicleData)
      .where(eq(smartcarVehicleData.smartcarVehicleId, vehicleId))
      .orderBy(desc(smartcarVehicleData.recordedAt));
    return data;
  }

  async getSmartcarVehicleLatestData(vehicleId: number): Promise<SmartcarVehicleData | undefined> {
    const [data] = await db.select()
      .from(smartcarVehicleData)
      .where(eq(smartcarVehicleData.smartcarVehicleId, vehicleId))
      .orderBy(desc(smartcarVehicleData.recordedAt))
      .limit(1);
    return data;
  }

  async createSmartcarVehicleData(data: InsertSmartcarVehicleData): Promise<SmartcarVehicleData> {
    const [inserted] = await db.insert(smartcarVehicleData)
      .values({
        ...data,
        recordedAt: new Date()
      })
      .returning();
    return inserted;
  }
}

// Usar almacenamiento de base de datos en lugar de memoria
import { db } from './db';
import { eq } from 'drizzle-orm';

export const storage = new DatabaseStorage();
