"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.MoysterCardApplication = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const FareCalculationService_1 = require("./services/FareCalculationService");
const FareStrategy_1 = require("./strategies/FareStrategy");
const CapStrategy_1 = require("./strategies/CapStrategy");
const FareRules_1 = require("./domain/FareRules");
const JourneyParser_1 = require("./input/JourneyParser");
const OutputFormatter_1 = require("./output/OutputFormatter");
/**
 * Main application entry point
 */
class MoysterCardApplication {
    service;
    jsonParser;
    csvParser;
    constructor() {
        const fareStrategy = new FareStrategy_1.StandardFareStrategy();
        const capStrategy = new CapStrategy_1.DailyWeeklyCapStrategy();
        const rules = FareRules_1.FareRules.createDefault();
        this.service = new FareCalculationService_1.FareCalculationService(fareStrategy, capStrategy, rules);
        this.jsonParser = new JourneyParser_1.JsonJourneyParser();
        this.csvParser = new JourneyParser_1.CsvJourneyParser();
    }
    /**
     * Processes a journey file and outputs the fare calculation
     */
    processFile(filePath, outputFormat = "text") {
        try {
            const content = fs.readFileSync(filePath, "utf-8");
            const ext = path.extname(filePath).toLowerCase();
            let journeys;
            if (ext === ".json") {
                journeys = this.jsonParser.parse(content);
            }
            else if (ext === ".csv") {
                journeys = this.csvParser.parse(content);
            }
            else {
                throw new Error(`Unsupported file format: ${ext}. Use .json or .csv`);
            }
            const result = this.service.calculateFares(journeys);
            const formatter = outputFormat === "json"
                ? new OutputFormatter_1.JsonOutputFormatter()
                : new OutputFormatter_1.TextOutputFormatter();
            console.log(formatter.format(result));
        }
        catch (error) {
            if (error instanceof Error) {
                console.error(`Error: ${error.message}`);
            }
            else {
                console.error("An unexpected error occurred");
            }
            process.exit(1);
        }
    }
    /**
     * Displays usage instructions
     */
    displayUsage() {
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
exports.MoysterCardApplication = MoysterCardApplication;
// Main execution
if (require.main === module) {
    const app = new MoysterCardApplication();
    const args = process.argv.slice(2);
    if (args.length === 0) {
        app.displayUsage();
        process.exit(0);
    }
    const filePath = args[0];
    const outputFormat = args[1] || "text";
    app.processFile(filePath, outputFormat);
}
