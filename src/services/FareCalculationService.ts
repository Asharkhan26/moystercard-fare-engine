import { Journey } from "../domain/Journey";
import { FareRules } from "../domain/FareRules";
import {
  FareCalculationResult,
  JourneyFare,
} from "../domain/FareCalculationResult";
import { FareStrategy } from "../strategies/FareStrategy";
import { CapStrategy, FareAccumulatorFactory } from "../strategies/CapStrategy";

/**
 * Service responsible for calculating fares for journeys
 * Follows Single Responsibility and Dependency Inversion principles
 */
export class FareCalculationService {
  constructor(
    private readonly fareStrategy: FareStrategy,
    private readonly capStrategy: CapStrategy,
    private readonly rules: FareRules
  ) {}

  /**
   * Calculates fares for a list of journeys
   * Journeys should be sorted by timestamp
   */
  calculateFares(journeys: Journey[]): FareCalculationResult {
    if (journeys.length === 0) {
      return {
        totalFare: 0,
        journeyFares: [],
      };
    }

    // Sort journeys by timestamp to ensure correct capping
    const sortedJourneys = [...journeys].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    );

    const accumulator = FareAccumulatorFactory.create();
    const journeyFares: JourneyFare[] = [];
    let totalFare = 0;

    for (const journey of sortedJourneys) {
      const baseFare = this.fareStrategy.calculateFare(journey, this.rules);
      const { chargedFare, explanation } = this.capStrategy.applyCap(
        journey,
        baseFare,
        accumulator,
        this.rules
      );

      journeyFares.push({
        timestamp: journey.timestamp,
        fromZone: journey.fromZone,
        toZone: journey.toZone,
        baseFare,
        chargedFare,
        explanation,
      });

      totalFare += chargedFare;
    }

    return {
      totalFare,
      journeyFares,
    };
  }
}
