  // SmartCar methods implementation
  async getSmartcarConfig(): Promise<SmartcarConfig | undefined> {
    // Get the first config
    const configs = Array.from(this.smartcarConfigs.values());
    return configs.length > 0 ? configs[0] : undefined;
  }

  async createSmartcarConfig(config: InsertSmartcarConfig): Promise<SmartcarConfig> {
    const id = this.smartcarConfigIdCounter++;
    const now = new Date();
    const newConfig: SmartcarConfig = { 
      ...config, 
      id,
      createdAt: now,
      updatedAt: now,
      isActive: true
    };
    this.smartcarConfigs.set(id, newConfig);
    return newConfig;
  }

  async updateSmartcarConfig(id: number, config: Partial<SmartcarConfig>): Promise<SmartcarConfig | undefined> {
    const existingConfig = this.smartcarConfigs.get(id);
    if (!existingConfig) {
      return undefined;
    }
    
    const updatedConfig: SmartcarConfig = { 
      ...existingConfig, 
      ...config, 
      updatedAt: new Date()
    };
    this.smartcarConfigs.set(id, updatedConfig);
    return updatedConfig;
  }
  
  // SmartCar vehicle methods
  async getSmartcarVehicles(userId: number): Promise<SmartcarVehicle[]> {
    return Array.from(this.smartcarVehicles.values())
      .filter(v => v.userId === userId);
  }

  async getSmartcarVehicleById(id: number): Promise<SmartcarVehicle | undefined> {
    return this.smartcarVehicles.get(id);
  }

  async createSmartcarVehicle(vehicle: InsertSmartcarVehicle): Promise<SmartcarVehicle> {
    const id = this.smartcarVehicleIdCounter++;
    const now = new Date();
    const newVehicle: SmartcarVehicle = { 
      ...vehicle, 
      id,
      createdAt: now,
      updatedAt: now
    };
    this.smartcarVehicles.set(id, newVehicle);
    return newVehicle;
  }

  async updateSmartcarVehicle(id: number, vehicle: Partial<SmartcarVehicle>): Promise<SmartcarVehicle | undefined> {
    const existingVehicle = this.smartcarVehicles.get(id);
    if (!existingVehicle) {
      return undefined;
    }
    
    const updatedVehicle: SmartcarVehicle = { 
      ...existingVehicle, 
      ...vehicle, 
      updatedAt: new Date()
    };
    this.smartcarVehicles.set(id, updatedVehicle);
    return updatedVehicle;
  }

  async deleteSmartcarVehicle(id: number): Promise<boolean> {
    // Delete related data first
    Array.from(this.smartcarVehicleData.values())
      .filter(data => data.smartcarVehicleId === id)
      .forEach(data => {
        this.smartcarVehicleData.delete(data.id);
      });
    
    // Then delete the vehicle
    return this.smartcarVehicles.delete(id);
  }
  
  // SmartCar vehicle data methods
  async getSmartcarVehicleData(vehicleId: number): Promise<SmartcarVehicleData[]> {
    const data = Array.from(this.smartcarVehicleData.values())
      .filter(d => d.smartcarVehicleId === vehicleId)
      .sort((a, b) => b.recordedAt.getTime() - a.recordedAt.getTime());
    
    return data;
  }

  async getSmartcarVehicleLatestData(vehicleId: number): Promise<SmartcarVehicleData | undefined> {
    const data = await this.getSmartcarVehicleData(vehicleId);
    return data.length > 0 ? data[0] : undefined;
  }

  async createSmartcarVehicleData(data: InsertSmartcarVehicleData): Promise<SmartcarVehicleData> {
    const id = this.smartcarVehicleDataIdCounter++;
    const now = new Date();
    const newData: SmartcarVehicleData = { 
      ...data, 
      id,
      createdAt: now,
      updatedAt: now,
      recordedAt: now
    };
    this.smartcarVehicleData.set(id, newData);
    return newData;
  }