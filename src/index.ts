import * as fs from "fs";
import * as path from "path";
import { FareCalculationService } from "./services/FareCalculationService";
import { StandardFareStrategy } from "./strategies/FareStrategy";

import { FareRules } from "./domain/FareRules";
import { JsonJourneyParser, CsvJourneyParser } from "./input/JourneyParser";
import {
  TextOutputFormatter,
  JsonOutputFormatter,
} from "./output/OutputFormatter";
import { DailyWeeklyCapStrategy } from "./strategies/CapStrategy";

/**
 * Main application entry point
 */
class MoysterCardApplication {
  private readonly service: FareCalculationService;
  private readonly jsonParser: JsonJourneyParser;
  private readonly csvParser: CsvJourneyParser;

  constructor() {
    const fareStrategy = new StandardFareStrategy();
    const capStrategy = new DailyWeeklyCapStrategy();
    const rules = FareRules.createDefault();

    this.service = new FareCalculationService(fareStrategy, capStrategy, rules);
    this.jsonParser = new JsonJourneyParser();
    this.csvParser = new CsvJourneyParser();
  }

  /**
   * Processes a journey file and outputs the fare calculation
   */
  processFile(filePath: string, outputFormat: "text" | "json" = "text"): void {
    try {
      const content = fs.readFileSync(filePath, "utf-8");
      const ext = path.extname(filePath).toLowerCase();

      let journeys;
      if (ext === ".json") {
        journeys = this.jsonParser.parse(content);
      } else if (ext === ".csv") {
        journeys = this.csvParser.parse(content);
      } else {
        throw new Error(`Unsupported file format: ${ext}. Use .json or .csv`);
      }

      const result = this.service.calculateFares(journeys);

      const formatter =
        outputFormat === "json"
          ? new JsonOutputFormatter()
          : new TextOutputFormatter();

      console.log(formatter.format(result));
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error: ${error.message}`);
      } else {
        console.error("An unexpected error occurred");
      }
      process.exit(1);
    }
  }

  /**
   * Displays usage instructions
   */
  displayUsage(): void {
    console.log(`
MoysterCard Fare Calculation Engine

Usage:
 node dist/index.js <input-file> [output-format]

Arguments:
 input-file Path to journey file (JSON or CSV format)
 output-format Output format: 'text' (default) or 'json'

Examples:
 node dist/index.js examples/example1.json
 node dist/index.js examples/example1.json json
 node dist/index.js examples/example2.csv text

Input File Formats:

JSON:
[
 { "timestamp": "2025-11-03T10:20:00", "fromZone": 2, "toZone": 1 },
 { "timestamp": "2025-11-03T10:45:00", "fromZone": 1, "toZone": 1 }
]

CSV:
timestamp,fromZone,toZone
2025-11-03T10:20:00,2,1
2025-11-03T10:45:00,1,1
 `);
  }
}

// Main execution
if (require.main === module) {
  const app = new MoysterCardApplication();
  const args = process.argv.slice(2);

  if (args.length === 0) {
    app.displayUsage();
    process.exit(0);
  }

  const filePath = args[0];
  const outputFormat = (args[1] as "text" | "json") || "text";

  app.processFile(filePath, outputFormat);
}

export { MoysterCardApplication };
