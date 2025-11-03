import { JsonJourneyParser, CsvJourneyParser } from "../input/JourneyParser";

describe("JsonJourneyParser", () => {
  let parser: JsonJourneyParser;

  beforeEach(() => {
    parser = new JsonJourneyParser();
  });

  it("should parse valid JSON journeys", () => {
    const input = JSON.stringify([
      { timestamp: "2025-11-03T10:20:00", fromZone: 2, toZone: 1 },
      { timestamp: "2025-11-03T10:45:00", fromZone: 1, toZone: 1 },
    ]);

    const journeys = parser.parse(input);

    expect(journeys).toHaveLength(2);
    expect(journeys[0].fromZone).toBe(2);
    expect(journeys[0].toZone).toBe(1);
    expect(journeys[1].fromZone).toBe(1);
    expect(journeys[1].toZone).toBe(1);
  });

  it("should throw error for invalid JSON", () => {
    expect(() => parser.parse("invalid json")).toThrow("Failed to parse JSON");
  });

  it("should throw error for non-array input", () => {
    expect(() => parser.parse("{}")).toThrow(
      "Input must be an array of journeys"
    );
  });

  it("should throw error for missing fields", () => {
    const input = JSON.stringify([
      { timestamp: "2025-11-03T10:20:00", fromZone: 2 },
    ]);

    expect(() => parser.parse(input)).toThrow("missing required fields");
  });

  it("should throw error for invalid timestamp", () => {
    const input = JSON.stringify([
      { timestamp: "invalid-date", fromZone: 2, toZone: 1 },
    ]);

    expect(() => parser.parse(input)).toThrow("Invalid timestamp");
  });
});

describe("CsvJourneyParser", () => {
  let parser: CsvJourneyParser;

  beforeEach(() => {
    parser = new CsvJourneyParser();
  });

  it("should parse valid CSV journeys without header", () => {
    const input = `2025-11-03T10:20:00,2,1
 2025-11-03T10:45:00,1,1`;

    const journeys = parser.parse(input);

    expect(journeys).toHaveLength(2);
    expect(journeys[0].fromZone).toBe(2);
    expect(journeys[0].toZone).toBe(1);
  });

  it("should parse valid CSV journeys with header", () => {
    const input = `timestamp,fromZone,toZone
 2025-11-03T10:20:00,2,1
 2025-11-03T10:45:00,1,1`;

    const journeys = parser.parse(input);

    expect(journeys).toHaveLength(2);
  });

  it("should handle empty input", () => {
    const journeys = parser.parse("");
    expect(journeys).toHaveLength(0);
  });

  it("should throw error for invalid CSV format", () => {
    const input = `2025-11-03T10:20:00,2`;
    expect(() => parser.parse(input)).toThrow("expected 3 columns");
  });

  it("should throw error for invalid timestamp", () => {
    const input = `invalid-date,2,1`;
    expect(() => parser.parse(input)).toThrow("Invalid timestamp");
  });

  it("should throw error for invalid zone numbers", () => {
    const input = `2025-11-03T10:20:00,abc,1`;
    expect(() => parser.parse(input)).toThrow("Invalid zone numbers");
  });
});
