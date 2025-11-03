/**
 * Represents the result of a fare calculation
 */
export interface FareCalculationResult {
  totalFare: number;
  journeyFares: JourneyFare[];
}

/**
 * Represents the fare for an individual journey
 */
export interface JourneyFare {
  timestamp: Date;
  fromZone: number;
  toZone: number;
  baseFare: number;
  chargedFare: number;
  explanation: string;
}
