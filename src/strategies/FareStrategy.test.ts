import { StandardFareStrategy } from "../strategies/FareStrategy";
import { Journey } from "../domain/Journey";
import { FareRules } from "../domain/FareRules";

describe("StandardFareStrategy", () => {
  let strategy: StandardFareStrategy;
  let rules: FareRules;

  beforeEach(() => {
    strategy = new StandardFareStrategy();
    rules = FareRules.createDefault();
  });

  it("should calculate peak fare for zone 1-1", () => {
    const journey = new Journey(new Date("2025-11-03T07:30:00"), 1, 1);
    expect(strategy.calculateFare(journey, rules)).toBe(30);
  });

  it("should calculate off-peak fare for zone 1-1", () => {
    const journey = new Journey(new Date("2025-11-03T12:00:00"), 1, 1);
    expect(strategy.calculateFare(journey, rules)).toBe(25);
  });

  it("should calculate peak fare for zone 1-2", () => {
    const journey = new Journey(new Date("2025-11-03T17:30:00"), 1, 2);
    expect(strategy.calculateFare(journey, rules)).toBe(35);
  });

  it("should calculate off-peak fare for zone 2-1", () => {
    const journey = new Journey(new Date("2025-11-03T16:00:00"), 2, 1);
    expect(strategy.calculateFare(journey, rules)).toBe(30);
  });

  it("should calculate peak fare for zone 2-2", () => {
    const journey = new Journey(new Date("2025-11-01T09:30:00"), 2, 2);
    expect(strategy.calculateFare(journey, rules)).toBe(25);
  });

  it("should calculate off-peak fare for zone 2-2", () => {
    const journey = new Journey(new Date("2025-11-03T22:00:00"), 2, 2);
    expect(strategy.calculateFare(journey, rules)).toBe(20);
  });
});
