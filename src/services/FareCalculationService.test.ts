import { FareCalculationService } from "../services/FareCalculationService";

import { FareRules } from "../domain/FareRules";
import { Journey } from "../domain/Journey";
import { StandardFareStrategy } from "../strategies/FareStrategy";
import { DailyWeeklyCapStrategy } from "../strategies/CapStrategy";

describe("FareCalculationService", () => {
  let service: FareCalculationService;

  beforeEach(() => {
    const fareStrategy = new StandardFareStrategy();
    const capStrategy = new DailyWeeklyCapStrategy();
    const rules = FareRules.createDefault();
    service = new FareCalculationService(fareStrategy, capStrategy, rules);
  });

  describe("Example 1 from specification - Daily Cap", () => {
    it("should calculate fares with daily cap correctly", () => {
      const journeys = [
        new Journey(new Date("2025-11-03T10:20:00"), 2, 1), // Peak: 35
        new Journey(new Date("2025-11-03T10:45:00"), 1, 1), // Off-peak: 25
        new Journey(new Date("2025-11-03T16:15:00"), 1, 1), // Off-peak: 25
        new Journey(new Date("2025-11-03T18:15:00"), 1, 1), // Peak: 30
        new Journey(new Date("2025-11-03T19:00:00"), 1, 2), // Peak: 35 but capped
      ];

      const result = service.calculateFares(journeys);

      expect(result.totalFare).toBe(120);
      expect(result.journeyFares).toHaveLength(5);

      // First journey
      expect(result.journeyFares[0].chargedFare).toBe(35);

      // Second journey
      expect(result.journeyFares[1].chargedFare).toBe(25);

      // Third journey
      expect(result.journeyFares[2].chargedFare).toBe(25);

      // Fourth journey
      expect(result.journeyFares[3].chargedFare).toBe(30);

      // Fifth journey - capped
      expect(result.journeyFares[4].chargedFare).toBe(5);
      expect(result.journeyFares[4].explanation).toContain("Daily cap");
    });
  });

  describe("Example 2 from specification - Weekly Cap", () => {
    it("should calculate fares with weekly cap correctly", () => {
      const journeys = [
        // Monday - daily cap 120
        new Journey(new Date("2025-11-03T07:00:00"), 1, 2),
        new Journey(new Date("2025-11-03T09:00:00"), 1, 2),
        new Journey(new Date("2025-11-03T17:00:00"), 1, 2),
        new Journey(new Date("2025-11-03T19:00:00"), 1, 2),

        // Tuesday - daily cap 120
        new Journey(new Date("2025-11-04T07:00:00"), 1, 2),
        new Journey(new Date("2025-11-04T09:00:00"), 1, 2),
        new Journey(new Date("2025-11-04T17:00:00"), 1, 2),
        new Journey(new Date("2025-11-04T19:00:00"), 1, 2),

        // Wednesday - daily cap 120
        new Journey(new Date("2025-11-05T07:00:00"), 1, 2),
        new Journey(new Date("2025-11-05T09:00:00"), 1, 2),
        new Journey(new Date("2025-11-05T17:00:00"), 1, 2),
        new Journey(new Date("2025-11-05T19:00:00"), 1, 2),

        // Thursday - daily cap 120
        new Journey(new Date("2025-11-06T07:00:00"), 1, 2),
        new Journey(new Date("2025-11-06T09:00:00"), 1, 2),
        new Journey(new Date("2025-11-06T17:00:00"), 1, 2),
        new Journey(new Date("2025-11-06T19:00:00"), 1, 2),

        // Friday - daily cap 120, but weekly cap (600) reached
        new Journey(new Date("2025-11-07T07:00:00"), 1, 2),
        new Journey(new Date("2025-11-07T09:00:00"), 1, 2),

        // Saturday - weekly cap causes this to be less
        new Journey(new Date("2025-11-08T09:00:00"), 1, 2),

        // Sunday - weekly cap reached
        new Journey(new Date("2025-11-09T10:00:00"), 1, 2),
      ];

      const result = service.calculateFares(journeys);

      expect(result.totalFare).toBe(600); // Weekly cap
    });
  });

  it("should handle empty journey list", () => {
    const result = service.calculateFares([]);
    expect(result.totalFare).toBe(0);
    expect(result.journeyFares).toHaveLength(0);
  });

  it("should sort journeys by timestamp", () => {
    const journeys = [
      new Journey(new Date("2025-11-03T18:00:00"), 1, 1),
      new Journey(new Date("2025-11-03T10:00:00"), 1, 1),
      new Journey(new Date("2025-11-03T14:00:00"), 1, 1),
    ];

    const result = service.calculateFares(journeys);

    expect(result.journeyFares[0].timestamp.getHours()).toBe(10);
    expect(result.journeyFares[1].timestamp.getHours()).toBe(14);
    expect(result.journeyFares[2].timestamp.getHours()).toBe(18);
  });

  it("should handle single journey", () => {
    const journeys = [new Journey(new Date("2025-11-03T10:00:00"), 1, 1)];

    const result = service.calculateFares(journeys);

    expect(result.totalFare).toBe(30);
    expect(result.journeyFares).toHaveLength(1);
  });

  it("should handle zone 2-2 journeys", () => {
    const journeys = [
      new Journey(new Date("2025-11-03T10:00:00"), 2, 2), // Peak: 25
      new Journey(new Date("2025-11-03T16:00:00"), 2, 2), // Off-peak: 20
    ];

    const result = service.calculateFares(journeys);

    expect(result.totalFare).toBe(45);
  });
});
