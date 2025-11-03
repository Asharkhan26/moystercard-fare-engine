import { Journey } from "./Journey";

describe("Journey", () => {
  describe("constructor", () => {
    it("should create a valid journey", () => {
      const journey = new Journey(new Date(), 1, 2);
      expect(journey.fromZone).toBe(1);
      expect(journey.toZone).toBe(2);
    });

    it("should throw error for invalid fromZone", () => {
      expect(() => new Journey(new Date(), 0, 1)).toThrow("Invalid zone");
      expect(() => new Journey(new Date(), 3, 1)).toThrow("Invalid zone");
    });

    it("should throw error for invalid toZone", () => {
      expect(() => new Journey(new Date(), 1, 0)).toThrow("Invalid zone");
      expect(() => new Journey(new Date(), 1, 3)).toThrow("Invalid zone");
    });
  });

  describe("getZonePair", () => {
    it("should return normalized zone pair", () => {
      const journey1 = new Journey(new Date(), 1, 2);
      const journey2 = new Journey(new Date(), 2, 1);
      
      expect(journey1.getZonePair()).toBe("1-2");
      expect(journey2.getZonePair()).toBe("1-2");
    });
  });

  describe("isPeakHour", () => {
    it("should identify weekday peak hours", () => {
      // Monday peak hours
      const morningPeak = new Journey(new Date("2025-11-03T08:30:00"), 1, 2); // 8:30 AM
      const eveningPeak = new Journey(new Date("2025-11-03T18:30:00"), 1, 2); // 6:30 PM
      const offPeak = new Journey(new Date("2025-11-03T14:30:00"), 1, 2); // 2:30 PM

      expect(morningPeak.isPeakHour()).toBe(true);
      expect(eveningPeak.isPeakHour()).toBe(true);
      expect(offPeak.isPeakHour()).toBe(false);
    });

    it("should identify weekend peak hours", () => {
      // Saturday peak hours
      const morningPeak = new Journey(new Date("2025-11-08T10:00:00"), 1, 2); // 10:00 AM
      const eveningPeak = new Journey(new Date("2025-11-08T19:00:00"), 1, 2); // 7:00 PM
      const offPeak = new Journey(new Date("2025-11-08T15:00:00"), 1, 2); // 3:00 PM

      expect(morningPeak.isPeakHour()).toBe(true);
      expect(eveningPeak.isPeakHour()).toBe(true);
      expect(offPeak.isPeakHour()).toBe(false);
    });
  });

  describe("getDate", () => {
    it("should return date at midnight", () => {
      const date = new Date("2025-11-03T15:30:00");
      const journey = new Journey(date, 1, 2);
      const returnedDate = journey.getDate();

      expect(returnedDate.getHours()).toBe(0);
      expect(returnedDate.getMinutes()).toBe(0);
      expect(returnedDate.getSeconds()).toBe(0);
      expect(returnedDate.getMilliseconds()).toBe(0);
    });
  });

  describe("getWeekIdentifier", () => {
    it("should return Monday of the week", () => {
      // Wednesday journey
      const journey = new Journey(new Date("2025-11-05T15:30:00"), 1, 2);
      const weekId = journey.getWeekIdentifier();

      expect(weekId).toBe("2025-11-03"); // Should return Mondays date
    });
  });
});
