"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CsvJourneyParser = exports.JsonJourneyParser = void 0;
const Journey_1 = require("../domain/Journey");
/**
 * Parses journeys from JSON format
 */
class JsonJourneyParser {
    parse(input) {
        try {
            const data = JSON.parse(input);
            return this.validateAndConvert(data);
        }
        catch (error) {
            throw new Error(`Failed to parse JSON: ${error}`);
        }
    }
    validateAndConvert(data) {
        if (!Array.isArray(data)) {
            throw new Error("Input must be an array of journeys");
        }
        return data.map((item, index) => {
            if (!item.timestamp ||
                typeof item.fromZone !== "number" ||
                typeof item.toZone !== "number") {
                throw new Error(`Invalid journey at index ${index}: missing required fields`);
            }
            const timestamp = new Date(item.timestamp);
            if (isNaN(timestamp.getTime())) {
                throw new Error(`Invalid timestamp at index ${index}: ${item.timestamp}`);
            }
            return new Journey_1.Journey(timestamp, item.fromZone, item.toZone);
        });
    }
}
exports.JsonJourneyParser = JsonJourneyParser;
/**
 * Parses journeys from CSV format
 * Expected format: timestamp,fromZone,toZone
 */
class CsvJourneyParser {
    parse(input) {
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
                throw new Error(`Invalid CSV line at ${index + 1}: expected 3 columns, got ${parts.length}`);
            }
            const [timestampStr, fromZoneStr, toZoneStr] = parts;
            const timestamp = new Date(timestampStr);
            if (isNaN(timestamp.getTime())) {
                throw new Error(`Invalid timestamp at line ${index + 1}: ${timestampStr}`);
            }
            const fromZone = parseInt(fromZoneStr, 10);
            const toZone = parseInt(toZoneStr, 10);
            if (isNaN(fromZone) || isNaN(toZone)) {
                throw new Error(`Invalid zone numbers at line ${index + 1}`);
            }
            return new Journey_1.Journey(timestamp, fromZone, toZone);
        });
    }
    hasHeader(firstLine) {
        const lower = firstLine.toLowerCase();
        return (lower.includes("timestamp") ||
            lower.includes("from") ||
            lower.includes("to"));
    }
}
exports.CsvJourneyParser = CsvJourneyParser;
