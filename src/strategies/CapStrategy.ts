import { FareRules } from "../domain/FareRules";
import { Journey } from "../domain/Journey";

/**
 * Tracks accumulated fares for capping purposes
 */
interface FareAccumulator {
  daily: Map<string, number>; // date -> fare
  weekly: Map<string, number>; // week -> fare
  dailyZones: Map<string, Set<string>>; // date -> zone pairs
  weeklyZones: Map<string, Set<string>>; // week -> zone pairs
}

/**
 * Strategy interface for applying fare caps
 * Follows Strategy Pattern and Single Responsibility Principle
 */
export interface CapStrategy {
  applyCap(
    journey: Journey,
    baseFare: number,
    accumulator: FareAccumulator,
    rules: FareRules
  ): { chargedFare: number; explanation: string };
}

/**
 * Applies daily and weekly fare caps
 */
export class DailyWeeklyCapStrategy implements CapStrategy {
  applyCap(
    journey: Journey,
    baseFare: number,
    accumulator: FareAccumulator,
    rules: FareRules
  ): { chargedFare: number; explanation: string } {
    const dateKey = journey.getDate().toISOString().split("T")[0];
    const weekKey = journey.getWeekIdentifier();
    const zonePair = journey.getZonePair();

    // Initialize if needed
    if (!accumulator.daily.has(dateKey)) {
      accumulator.daily.set(dateKey, 0);
      accumulator.dailyZones.set(dateKey, new Set());
    }
    if (!accumulator.weekly.has(weekKey)) {
      accumulator.weekly.set(weekKey, 0);
      accumulator.weeklyZones.set(weekKey, new Set());
    }

    // Track zone pairs
    accumulator.dailyZones.get(dateKey)!.add(zonePair);
    accumulator.weeklyZones.get(weekKey)!.add(zonePair);

    const dailyTotal = accumulator.daily.get(dateKey)!;
    const weeklyTotal = accumulator.weekly.get(weekKey)!;

    // Debug logging
    console.log(`\nProcessing journey:
    Date: ${dateKey}
    Weekly Total before: ${weeklyTotal}
    Daily Total before: ${dailyTotal}
    Base Fare: ${baseFare}
    Zone Pair: ${zonePair}`);

    // Get applicable caps based on farthest journey
    const dailyZones = Array.from(accumulator.dailyZones.get(dateKey)!);
    const weeklyZones = Array.from(accumulator.weeklyZones.get(weekKey)!);

    const applicableDailyZone = rules.getApplicableCapZone(dailyZones);
    const applicableWeeklyZone = rules.getApplicableCapZone(weeklyZones);

    const dailyCap = rules.getDailyCap(applicableDailyZone);
    const weeklyCap = rules.getWeeklyCap(applicableWeeklyZone);

    let chargedFare = baseFare;
    let explanation = journey.isPeakHour() ? "Peak hour fare" : "Off-peak fare";

    // First handle the weekly cap
    const remainingWeekly = Math.max(0, weeklyCap - weeklyTotal);
    if (remainingWeekly === 0) {
      // If we've hit the weekly cap, no more charges
      return {
        chargedFare: 0,
        explanation: `Weekly cap (${weeklyCap}) reached`,
      };
    }

    // Then check daily cap
    if (dailyTotal >= dailyCap) {
      return {
        chargedFare: 0,
        explanation: `Daily cap (${dailyCap}) reached`,
      };
    }

    // Calculate how much we can charge today
    let maxDailyCharge = Math.min(
      dailyCap - dailyTotal, // What's left until daily cap
      baseFare // The base fare
    );

    // Further limit by weekly cap
    chargedFare = Math.min(maxDailyCharge, remainingWeekly);

    // Set appropriate explanation
    if (chargedFare < baseFare) {
      if (chargedFare === remainingWeekly) {
        explanation = `Weekly cap (${weeklyCap}) reached; charged ${chargedFare} instead of ${baseFare}`;
      } else {
        explanation = `Daily cap (${dailyCap}) reached; charged ${chargedFare} instead of ${baseFare}`;
      }
    }

    // Update accumulators
    accumulator.daily.set(dateKey, dailyTotal + chargedFare);
    accumulator.weekly.set(weekKey, weeklyTotal + chargedFare);

    return { chargedFare, explanation };
  }
}

/**
 * Factory for creating fare accumulators
 */
export class FareAccumulatorFactory {
  static create(): FareAccumulator {
    return {
      daily: new Map(),
      weekly: new Map(),
      dailyZones: new Map(),
      weeklyZones: new Map(),
    };
  }
}
