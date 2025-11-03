/**
 * Represents fare configuration for different zone pairs
 */
export interface FareConfig {
  zonePair: string;
  peakFare: number;
  offPeakFare: number;
}

/**
 * Represents daily and weekly cap configuration
 */
export interface CapConfig {
  zonePair: string;
  dailyCap: number;
  weeklyCap: number;
}

/**
 * Immutable fare rules configuration
 */
export class FareRules {
  private readonly fareMap: Map<string, FareConfig>;
  private readonly capMap: Map<string, CapConfig>;

  constructor(fares: FareConfig[], caps: CapConfig[]) {
    this.fareMap = new Map(fares.map((f) => [f.zonePair, f]));
    this.capMap = new Map(caps.map((c) => [c.zonePair, c]));
  }

  /**
   * Gets the fare for a specific zone pair
   */
  getFare(zonePair: string, isPeak: boolean): number {
    const fareConfig = this.fareMap.get(zonePair);
    if (!fareConfig) {
      throw new Error(`No fare configuration found for zone pair: ${zonePair}`);
    }
    return isPeak ? fareConfig.peakFare : fareConfig.offPeakFare;
  }

  /**
   * Gets the daily cap for a zone pair
   */
  getDailyCap(zonePair: string): number {
    const capConfig = this.capMap.get(zonePair);
    if (!capConfig) {
      throw new Error(`No cap configuration found for zone pair: ${zonePair}`);
    }
    return capConfig.dailyCap;
  }

  /**
   * Gets the weekly cap for a zone pair
   */
  getWeeklyCap(zonePair: string): number {
    const capConfig = this.capMap.get(zonePair);
    if (!capConfig) {
      throw new Error(`No cap configuration found for zone pair: ${zonePair}`);
    }
    return capConfig.weeklyCap;
  }

  /**
   * Gets all zone pairs that are configured
   */
  getAllZonePairs(): string[] {
    return Array.from(this.fareMap.keys());
  }

  /**
   * Determines the applicable zone pair for capping based on the farthest journey
   */
  getApplicableCapZone(zonePairs: string[]): string {
    // Find the zone pair with the highest maximum zone
    let maxZonePair = "1-1";
    let maxZone = 1;

    for (const pair of zonePairs) {
      const zones = pair.split("-").map(Number);
      const currentMax = Math.max(...zones);
      if (currentMax > maxZone) {
        maxZone = currentMax;
        maxZonePair = pair;
      }
    }

    return maxZonePair;
  }

  /**
   * Factory method to create default fare rules as per specification
   */
  static createDefault(): FareRules {
    const fares: FareConfig[] = [
      { zonePair: "1-1", peakFare: 30, offPeakFare: 25 },
      { zonePair: "1-2", peakFare: 35, offPeakFare: 30 },
      { zonePair: "2-2", peakFare: 25, offPeakFare: 20 },
    ];

    const caps: CapConfig[] = [
      { zonePair: "1-1", dailyCap: 100, weeklyCap: 500 },
      { zonePair: "1-2", dailyCap: 120, weeklyCap: 600 },
      { zonePair: "2-2", dailyCap: 80, weeklyCap: 400 },
    ];

    return new FareRules(fares, caps);
  }
}
