import { FareCalculationResult } from "../domain/FareCalculationResult";

/**
 * Formatter interface for output
 * Follows Open/Closed Principle
 */
export interface OutputFormatter {
  format(result: FareCalculationResult): string;
}

/**
 * Formats output as JSON
 */
export class JsonOutputFormatter implements OutputFormatter {
  format(result: FareCalculationResult): string {
    return JSON.stringify(result, null, 2);
  }
}

/**
 * Formats output as human-readable text
 */
export class TextOutputFormatter implements OutputFormatter {
  format(result: FareCalculationResult): string {
    const lines: string[] = [];
    lines.push("=".repeat(80));
    lines.push("MOYSTERCARD FARE CALCULATION RESULT");
    lines.push("=".repeat(80));
    lines.push("");

    if (result.journeyFares.length === 0) {
      lines.push("No journeys found.");
    } else {
      lines.push("Journey Details:");
      lines.push("-".repeat(80));

      result.journeyFares.forEach((jf, index) => {
        const date = jf.timestamp.toLocaleDateString("en-GB");
        const time = jf.timestamp.toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
        });

        lines.push(
          `${index + 1}. ${date} ${time} | Zone ${jf.fromZone} → ${jf.toZone}`
        );
        lines.push(` Base Fare: ${jf.baseFare} | Charged: ${jf.chargedFare}`);
        lines.push(` ${jf.explanation}`);
        lines.push("");
      });

      lines.push("-".repeat(80));
    }

    lines.push("");
    lines.push(`TOTAL FARE: ${result.totalFare}`);
    lines.push("=".repeat(80));

    return lines.join("\n");
  }
}

/**
 * Formats output as CSV
 */
export class CsvOutputFormatter implements OutputFormatter {
  format(result: FareCalculationResult): string {
    const lines: string[] = [];
    lines.push(
      "Timestamp,From Zone,To Zone,Base Fare,Charged Fare,Explanation"
    );

    result.journeyFares.forEach((jf) => {
      const timestamp = jf.timestamp.toISOString();
      const baseFare = jf.baseFare;
      const chargedFare = jf.chargedFare;
      const explanation = jf.explanation.replace(/,/g, ";"); // Escape commas

      lines.push(
        `${timestamp},${jf.fromZone},${jf.toZone},${baseFare},${chargedFare},${explanation}`
      );
    });

    lines.push("");
    lines.push(`Total Fare,,,,,${result.totalFare}`);

    return lines.join("\n");
  }
}
