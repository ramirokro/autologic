declare module 'smartcar' {
  export default class Smartcar {
    constructor(options: {
      clientId: string;
      clientSecret: string;
      redirectUri: string;
      scope?: string[];
      testMode?: boolean;
    });

    getAuthUrl(options: { state?: string }): string;

    exchangeCode(code: string): Promise<Smartcar.Token>;

    exchangeRefreshToken(refreshToken: string): Promise<Smartcar.Token>;

    getVehicles(accessToken: string): Promise<{ vehicles: string[] }>;

    Vehicle: Smartcar.VehicleConstructor;
  }

  namespace Smartcar {
    interface Token {
      accessToken: string;
      refreshToken: string;
      expiration: number; // timestamp in seconds
    }

    interface VehicleConstructor {
      new (id: string, accessToken: string): Vehicle;
    }

    interface Vehicle {
      id: string;
      accessToken: string;

      info(): Promise<Vehicle.Info>;
      odometer(): Promise<Vehicle.Odometer>;
      engineOil(): Promise<Vehicle.EngineOil>;
      battery(): Promise<Vehicle.Battery>;
      tirePressure(): Promise<Vehicle.TirePressure>;
      fuel(): Promise<Vehicle.Fuel>;
      location(): Promise<Vehicle.Location>;
    }

    namespace Vehicle {
      interface Info {
        id: string;
        make: string;
        model: string;
        year: number;
        vin: string;
        fuel?: boolean;
        battery?: boolean;
      }

      interface Odometer {
        distance: number;
        unit: string;
      }

      interface EngineOil {
        lifeRemaining: number;
      }

      interface Battery {
        percentRemaining: number;
        range: number;
        unit: string;
      }

      interface Fuel {
        percentRemaining: number;
        range: number;
        unit: string;
      }

      interface TirePressure {
        frontLeft?: number;
        frontRight?: number;
        backLeft?: number;
        backRight?: number;
        unit: string;
      }

      interface Location {
        latitude: number;
        longitude: number;
      }
    }
  }
}