"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CsvOutputFormatter = exports.TextOutputFormatter = exports.JsonOutputFormatter = void 0;
/**
 * Formats output as JSON
 */
class JsonOutputFormatter {
    format(result) {
        return JSON.stringify(result, null, 2);
    }
}
exports.JsonOutputFormatter = JsonOutputFormatter;
/**
 * Formats output as human-readable text
 */
class TextOutputFormatter {
    format(result) {
        const lines = [];
        lines.push("=".repeat(80));
        lines.push("MOYSTERCARD FARE CALCULATION RESULT");
        lines.push("=".repeat(80));
        lines.push("");
        if (result.journeyFares.length === 0) {
            lines.push("No journeys found.");
        }
        else {
            lines.push("Journey Details:");
            lines.push("-".repeat(80));
            result.journeyFares.forEach((jf, index) => {
                const date = jf.timestamp.toLocaleDateString("en-GB");
                const time = jf.timestamp.toLocaleTimeString("en-GB", {
                    hour: "2-digit",
                    minute: "2-digit",
                });
                lines.push(`${index + 1}. ${date} ${time} | Zone ${jf.fromZone} → ${jf.toZone}`);
                lines.push(` Base Fare: £${(jf.baseFare / 100).toFixed(2)} | Charged: £${(jf.chargedFare / 100).toFixed(2)}`);
                lines.push(` ${jf.explanation}`);
                lines.push("");
            });
            lines.push("-".repeat(80));
        }
        lines.push("");
        lines.push(`TOTAL FARE: £${(result.totalFare / 100).toFixed(2)}`);
        lines.push("=".repeat(80));
        return lines.join("\n");
    }
}
exports.TextOutputFormatter = TextOutputFormatter;
/**
 * Formats output as CSV
 */
class CsvOutputFormatter {
    format(result) {
        const lines = [];
        lines.push("Timestamp,From Zone,To Zone,Base Fare,Charged Fare,Explanation");
        result.journeyFares.forEach((jf) => {
            const timestamp = jf.timestamp.toISOString();
            const baseFare = (jf.baseFare / 100).toFixed(2);
            const chargedFare = (jf.chargedFare / 100).toFixed(2);
            const explanation = jf.explanation.replace(/,/g, ";"); // Escape commas
            lines.push(`${timestamp},${jf.fromZone},${jf.toZone},${baseFare},${chargedFare},${explanation}`);
        });
        lines.push("");
        lines.push(`Total Fare,,,,,${(result.totalFare / 100).toFixed(2)}`);
        return lines.join("\n");
    }
}
exports.CsvOutputFormatter = CsvOutputFormatter;
