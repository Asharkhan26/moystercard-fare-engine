"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FareCalculationService = void 0;
const CapStrategy_1 = require("../strategies/CapStrategy");
/**
 * Service responsible for calculating fares for journeys
 * Follows Single Responsibility and Dependency Inversion principles
 */
class FareCalculationService {
    fareStrategy;
    capStrategy;
    rules;
    constructor(fareStrategy, capStrategy, rules) {
        this.fareStrategy = fareStrategy;
        this.capStrategy = capStrategy;
        this.rules = rules;
    }
    /**
     * Calculates fares for a list of journeys
     * Journeys should be sorted by timestamp
     */
    calculateFares(journeys) {
        if (journeys.length === 0) {
            return {
                totalFare: 0,
                journeyFares: [],
            };
        }
        // Sort journeys by timestamp to ensure correct capping
        const sortedJourneys = [...journeys].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
        const accumulator = CapStrategy_1.FareAccumulatorFactory.create();
        const journeyFares = [];
        let totalFare = 0;
        for (const journey of sortedJourneys) {
            const baseFare = this.fareStrategy.calculateFare(journey, this.rules);
            const { chargedFare, explanation } = this.capStrategy.applyCap(journey, baseFare, accumulator, this.rules);
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
exports.FareCalculationService = FareCalculationService;
