"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FareAccumulatorFactory = exports.DailyWeeklyCapStrategy = void 0;
/**
 * Applies daily and weekly fare caps
 */
class DailyWeeklyCapStrategy {
    applyCap(journey, baseFare, accumulator, rules) {
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
        accumulator.dailyZones.get(dateKey).add(zonePair);
        accumulator.weeklyZones.get(weekKey).add(zonePair);
        const dailyTotal = accumulator.daily.get(dateKey);
        const weeklyTotal = accumulator.weekly.get(weekKey);
        // Get applicable caps based on farthest journey
        const dailyZones = Array.from(accumulator.dailyZones.get(dateKey));
        const weeklyZones = Array.from(accumulator.weeklyZones.get(weekKey));
        const applicableDailyZone = rules.getApplicableCapZone(dailyZones);
        const applicableWeeklyZone = rules.getApplicableCapZone(weeklyZones);
        const dailyCap = rules.getDailyCap(applicableDailyZone);
        const weeklyCap = rules.getWeeklyCap(applicableWeeklyZone);
        // Check weekly cap first
        if (weeklyTotal >= weeklyCap) {
            return {
                chargedFare: 0,
                explanation: `Weekly cap (${weeklyCap}) reached`,
            };
        }
        // Check daily cap
        if (dailyTotal >= dailyCap) {
            return {
                chargedFare: 0,
                explanation: `Daily cap (${dailyCap}) reached`,
            };
        }
        // Calculate how much can be charged
        let chargedFare = baseFare;
        let explanation = journey.isPeakHour() ? "Peak hour fare" : "Off-peak fare";
        // Check if adding full fare would exceed daily cap
        if (dailyTotal + baseFare > dailyCap) {
            chargedFare = dailyCap - dailyTotal;
            explanation = `Daily cap (${dailyCap}) reached; charged ${chargedFare} instead of ${baseFare}`;
        }
        // Check if adding charged fare would exceed weekly cap
        if (weeklyTotal + chargedFare > weeklyCap) {
            chargedFare = weeklyCap - weeklyTotal;
            explanation = `Weekly cap (${weeklyCap}) reached; charged ${chargedFare} instead of ${baseFare}`;
        }
        // Update accumulators
        accumulator.daily.set(dateKey, dailyTotal + chargedFare);
        accumulator.weekly.set(weekKey, weeklyTotal + chargedFare);
        return { chargedFare, explanation };
    }
}
exports.DailyWeeklyCapStrategy = DailyWeeklyCapStrategy;
/**
 * Factory for creating fare accumulators
 */
class FareAccumulatorFactory {
    static create() {
        return {
            daily: new Map(),
            weekly: new Map(),
            dailyZones: new Map(),
            weeklyZones: new Map(),
        };
    }
}
exports.FareAccumulatorFactory = FareAccumulatorFactory;
