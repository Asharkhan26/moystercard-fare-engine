import { FareRules } from "../domain/FareRules";

describe("FareRules", () => {
  let rules: FareRules;

  beforeEach(() => {
    rules = FareRules.createDefault();
  });

  describe("getFare", () => {
    it("should return correct peak fares", () => {
      expect(rules.getFare("1-1", true)).toBe(30);
      expect(rules.getFare("1-2", true)).toBe(35);
      expect(rules.getFare("2-2", true)).toBe(25);
    });

    it("should return correct off-peak fares", () => {
      expect(rules.getFare("1-1", false)).toBe(25);
      expect(rules.getFare("1-2", false)).toBe(30);
      expect(rules.getFare("2-2", false)).toBe(20);
    });

    it("should throw error for unknown zone pair", () => {
      expect(() => rules.getFare("3-3", true)).toThrow(
        "No fare configuration found"
      );
    });
  });

  describe("getDailyCap", () => {
    it("should return correct daily caps", () => {
      expect(rules.getDailyCap("1-1")).toBe(100);
      expect(rules.getDailyCap("1-2")).toBe(120);
      expect(rules.getDailyCap("2-2")).toBe(80);
    });

    it("should throw error for unknown zone pair", () => {
      expect(() => rules.getDailyCap("3-3")).toThrow(
        "No cap configuration found"
      );
    });
  });

  describe("getWeeklyCap", () => {
    it("should return correct weekly caps", () => {
      expect(rules.getWeeklyCap("1-1")).toBe(500);
      expect(rules.getWeeklyCap("1-2")).toBe(600);
      expect(rules.getWeeklyCap("2-2")).toBe(400);
    });

    it("should throw error for unknown zone pair", () => {
      expect(() => rules.getWeeklyCap("3-3")).toThrow(
        "No cap configuration found"
      );
    });
  });

  describe("getApplicableCapZone", () => {
    it("should return zone pair with highest zone", () => {
      expect(rules.getApplicableCapZone(["1-1", "1-2"])).toBe("1-2");
      expect(rules.getApplicableCapZone(["1-1", "2-2"])).toBe("2-2");
      expect(rules.getApplicableCapZone(["1-1"])).toBe("1-1");
    });

    it("should handle order independence", () => {
      expect(rules.getApplicableCapZone(["1-2", "1-1"])).toBe("1-2");
    });
  });

  describe("getAllZonePairs", () => {
    it("should return all configured zone pairs", () => {
      const pairs = rules.getAllZonePairs();
      expect(pairs).toHaveLength(3);
      expect(pairs).toContain("1-1");
      expect(pairs).toContain("1-2");
      expect(pairs).toContain("2-2");
    });
  });
});
