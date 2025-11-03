import { Journey } from "../domain/Journey";
import { FareRules } from "../domain/FareRules";

/**
 * Strategy interface for calculating base fare
 * Follows Strategy Pattern and Open/Closed Principle
 */
export interface FareStrategy {
  calculateFare(journey: Journey, rules: FareRules): number;
}

/**
 * Standard fare calculation based on peak/off-peak hours
 */
export class StandardFareStrategy implements FareStrategy {
  calculateFare(journey: Journey, rules: FareRules): number {
    const zonePair = journey.getZonePair();
    const isPeak = journey.isPeakHour();
    return rules.getFare(zonePair, isPeak);
  }
}
