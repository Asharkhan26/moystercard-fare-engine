"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StandardFareStrategy = void 0;
/**
 * Standard fare calculation based on peak/off-peak hours
 */
class StandardFareStrategy {
    calculateFare(journey, rules) {
        const zonePair = journey.getZonePair();
        const isPeak = journey.isPeakHour();
        return rules.getFare(zonePair, isPeak);
    }
}
exports.StandardFareStrategy = StandardFareStrategy;
