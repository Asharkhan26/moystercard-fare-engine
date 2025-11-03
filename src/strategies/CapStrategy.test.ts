import {
  DailyWeeklyCapStrategy,
  FareAccumulatorFactory,
} from "../strategies/CapStrategy";
import { Journey } from "../domain/Journey";
import { FareRules } from "../domain/FareRules";

describe("DailyWeeklyCapStrategy", () => {
  let strategy: DailyWeeklyCapStrategy;
  let rules: FareRules;

  beforeEach(() => {
    strategy = new DailyWeeklyCapStrategy();
    rules = FareRules.createDefault();
  });

  describe("Daily Capping", () => {
    it("should charge full fare when under daily cap", () => {
      const accumulator = FareAccumulatorFactory.create();
      const journey = new Journey(new Date("2025-11-03T10:00:00"), 1, 1);

      const result = strategy.applyCap(journey, 30, accumulator, rules);

      expect(result.chargedFare).toBe(30);
      expect(result.explanation).toContain("Peak hour fare");
    });

    it("should apply daily cap when reached", () => {
      const accumulator = FareAccumulatorFactory.create();
      const date = "2025-11-03";

      // Simulate 3 journeys totaling 90 (zone 1-1 daily cap is 100)
      accumulator.daily.set(date, 90);
      accumulator.dailyZones.set(date, new Set(["1-1"]));
      accumulator.weekly.set("2025-11-03", 90);
      accumulator.weeklyZones.set("2025-11-03", new Set(["1-1"]));

      const journey = new Journey(new Date("2025-11-03T16:00:00"), 1, 1);
      const result = strategy.applyCap(journey, 30, accumulator, rules);

      // Should charge only 10 to reach the 100 cap
      expect(result.chargedFare).toBe(10);
      expect(result.explanation).toContain("Daily cap (100) reached");
    });

    it("should charge zero when daily cap already exceeded", () => {
      const accumulator = FareAccumulatorFactory.create();
      const date = "2025-11-03";

      accumulator.daily.set(date, 100);
      accumulator.dailyZones.set(date, new Set(["1-1"]));
      accumulator.weekly.set("2025-11-03", 100);
      accumulator.weeklyZones.set("2025-11-03", new Set(["1-1"]));

      const journey = new Journey(new Date("2025-11-03T18:00:00"), 1, 1);
      const result = strategy.applyCap(journey, 30, accumulator, rules);

      expect(result.chargedFare).toBe(0);
      expect(result.explanation).toContain("Daily cap (100) reached");
    });

    it("should use higher cap when traveling across zones", () => {
      const accumulator = FareAccumulatorFactory.create();
      const date = "2025-11-03";

      // First journey zone 1-1
      accumulator.daily.set(date, 80);
      accumulator.dailyZones.set(date, new Set(["1-1"]));
      accumulator.weekly.set("2025-11-03", 80);
      accumulator.weeklyZones.set("2025-11-03", new Set(["1-1"]));

      // Second journey zone 1-2 (should now use 120 cap)
      const journey = new Journey(new Date("2025-11-03T16:00:00"), 1, 2);
      const result = strategy.applyCap(journey, 35, accumulator, rules);

      expect(result.chargedFare).toBe(35);
      expect(accumulator.daily.get(date)).toBe(115);
    });
  });

  describe("Weekly Capping", () => {
    it("should apply weekly cap across multiple days", () => {
      const accumulator = FareAccumulatorFactory.create();
      const weekKey = "2025-11-03"; // Monday

      // Simulate 5 days of travel, each hitting daily cap of 120 (zone 1-2)
      accumulator.weekly.set(weekKey, 480); // 4 days * 120
      accumulator.weeklyZones.set(weekKey, new Set(["1-2"]));

      // Friday journey
      const dateKey = "2025-11-07";
      accumulator.daily.set(dateKey, 0);
      accumulator.dailyZones.set(dateKey, new Set());

      const journey = new Journey(new Date("2025-11-07T10:00:00"), 1, 2);
      const result = strategy.applyCap(journey, 35, accumulator, rules);

      // Weekly cap is 600, so can charge up to 120 more
      expect(result.chargedFare).toBe(35);
      expect(accumulator.weekly.get(weekKey)).toBe(515);
    });

    it("should charge zero when weekly cap exceeded", () => {
      const accumulator = FareAccumulatorFactory.create();
      const weekKey = "2025-11-03";

      accumulator.weekly.set(weekKey, 600); // Weekly cap reached
      accumulator.weeklyZones.set(weekKey, new Set(["1-2"]));

      const dateKey = "2025-11-08";
      accumulator.daily.set(dateKey, 0);
      accumulator.dailyZones.set(dateKey, new Set());

      const journey = new Journey(new Date("2025-11-08T10:00:00"), 1, 2);
      const result = strategy.applyCap(journey, 35, accumulator, rules);

      expect(result.chargedFare).toBe(0);
      expect(result.explanation).toContain("Weekly cap (600) reached");
    });

    it("should reset for new week", () => {
      const accumulator = FareAccumulatorFactory.create();

      // Previous week
      accumulator.weekly.set("2025-11-03", 600);
      accumulator.weeklyZones.set("2025-11-03", new Set(["1-2"]));

      // New week starts Monday Nov 10
      const journey = new Journey(new Date("2025-11-10T10:00:00"), 1, 2);
      const result = strategy.applyCap(journey, 35, accumulator, rules);

      expect(result.chargedFare).toBe(35);
      expect(accumulator.weekly.get("2025-11-10")).toBe(35);
    });
  });
});
