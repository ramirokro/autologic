// Vehicle interfaces
export interface IVehicle {
  id?: number;
  year: number;
  make: string;
  model: string;
  submodel?: string;
  engine?: string;
}

export interface IVehicleFilter {
  year?: number;
  make?: string;
  model?: string;
  engine?: string;
}

// Product interfaces
export interface IProduct {
  id: number;
  sku: string;
  title: string;
  description: string;
  price: number;
  brand: string;
  category: string;
  stock: number;
  inStock: boolean;
  images: string[];
}

export interface IProductDetails extends IProduct {
  compatibleVehicles: IVehicle[];
}

// Filter interfaces
export interface ICategory {
  id: number;
  name: string;
  count: number;
}

export interface IBrand {
  id: number;
  name: string;
  count: number;
}

export interface ICatalogFilters {
  categories?: string[];
  brands?: string[];
  priceRange?: {
    min?: number;
    max?: number;
  };
  availability?: 'instock' | 'backorder' | 'all';
}

// Import data interfaces
export interface IImportOptions {
  type: 'products' | 'compatibility';
  format: 'csv' | 'xml';
  updateExisting: boolean;
  deleteExisting: boolean;
  validateAces: boolean;
  sendNotification: boolean;
}

export interface IOBDCode {
  code: string;
  description: string;
}

export interface IDiagnosticRequest {
  vehicleInfo?: {
    year?: number;
    make?: string;
    model?: string;
    engine?: string;
  };
  obdCodes?: string[];
  symptoms?: string[];
  additionalInfo?: string;
  chatHistory?: IChatMessage[];
}

export interface IChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface IDiagnosticResponse {
  diagnosis: string;
  chatHistory: IChatMessage[];
}
