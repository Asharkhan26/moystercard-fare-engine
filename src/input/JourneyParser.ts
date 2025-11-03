import { Journey } from "../domain/Journey";

/**
 * Raw journey data format for input
 */
export interface JourneyInput {
  timestamp: string; // ISO 8601 format or parseable date string
  fromZone: number;
  toZone: number;
}

/**
 * Parser interface for different input formats
 * Follows Open/Closed Principle - can add new parsers without modifying existing code
 */
export interface JourneyParser {
  parse(input: string): Journey[];
}

/**
 * Parses journeys from JSON format
 */
export class JsonJourneyParser implements JourneyParser {
  parse(input: string): Journey[] {
    try {
      const data: JourneyInput[] = JSON.parse(input);
      return this.validateAndConvert(data);
    } catch (error) {
      throw new Error(`Failed to parse JSON: ${error}`);
    }
  }

  private validateAndConvert(data: JourneyInput[]): Journey[] {
    if (!Array.isArray(data)) {
      throw new Error("Input must be an array of journeys");
    }

    return data.map((item, index) => {
      if (
        !item.timestamp ||
        typeof item.fromZone !== "number" ||
        typeof item.toZone !== "number"
      ) {
        throw new Error(
          `Invalid journey at index ${index}: missing required fields`
        );
      }

      const timestamp = new Date(item.timestamp);
      if (isNaN(timestamp.getTime())) {
        throw new Error(
          `Invalid timestamp at index ${index}: ${item.timestamp}`
        );
      }

      return new Journey(timestamp, item.fromZone, item.toZone);
    });
  }
}

/**
 * Parses journeys from CSV format
 * Expected format: timestamp,fromZone,toZone
 */
export class CsvJourneyParser implements JourneyParser {
  parse(input: string): Journey[] {
    const trimmed = input.trim();

    if (trimmed.length === 0) {
      return [];
    }

    const lines = trimmed.split("\n");

    // Skip header if present
    const dataLines = this.hasHeader(lines[0]) ? lines.slice(1) : lines;

    return dataLines.map((line, index) => {
      const parts = line.split(",").map((p) => p.trim());

      if (parts.length !== 3) {
        throw new Error(
          `Invalid CSV line at ${index + 1}: expected 3 columns, got ${
            parts.length
          }`
        );
      }

      const [timestampStr, fromZoneStr, toZoneStr] = parts;
      const timestamp = new Date(timestampStr);

      if (isNaN(timestamp.getTime())) {
        throw new Error(
          `Invalid timestamp at line ${index + 1}: ${timestampStr}`
        );
      }

      const fromZone = parseInt(fromZoneStr, 10);
      const toZone = parseInt(toZoneStr, 10);

      if (isNaN(fromZone) || isNaN(toZone)) {
        throw new Error(`Invalid zone numbers at line ${index + 1}`);
      }

      return new Journey(timestamp, fromZone, toZone);
    });
  }

  private hasHeader(firstLine: string): boolean {
    const lower = firstLine.toLowerCase();
    return (
      lower.includes("timestamp") ||
      lower.includes("from") ||
      lower.includes("to")
    );
  }
}
