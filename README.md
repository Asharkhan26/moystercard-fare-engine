# MoysterCard Fare Engine

A TypeScript implementation of a public transport fare calculation system that handles zone-based fares, peak/off-peak pricing, and daily/weekly fare capping.

## Features

- Zone-based fare calculation (Zones 1-2)
- Peak and off-peak fare differentiation
- Daily fare capping
- Weekly fare capping
- Support for both CSV and JSON input formats
- Detailed journey breakdown in output

## Fare Rules

### Base Fares

| Journey  | Peak | Off-Peak |
| -------- | ---- | -------- |
| Zone 1-1 | 30   | 25       |
| Zone 1-2 | 35   | 30       |
| Zone 2-2 | 25   | 20       |

### Caps

| Journey  | Daily Cap | Weekly Cap |
| -------- | --------- | ---------- |
| Zone 1-1 | 100       | 500        |
| Zone 1-2 | 120       | 600        |
| Zone 2-2 | 80        | 400        |

### Peak Hours

- **Weekdays**:
  - Morning: 07:00 - 10:30
  - Evening: 17:00 - 20:00
- **Weekends**:
  - Morning: 09:00 - 11:00
  - Evening: 18:00 - 22:00

## Prerequisites

- Node.js (v20 or higher)
- npm (comes with Node.js)

## Setup

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd moystercard-fare-engine
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Build the project:
   ```bash
   npm run build
   ```

## Usage

### Running with CSV Input

```bash
npx ts-node src/index.ts examples/example1-daily-cap.csv
```

### Running with JSON Input

```bash
npx ts-node src/index.ts examples/example3-zone2.json
```

### Input Format

#### CSV Format

```csv
timestamp,fromZone,toZone
2025-11-03T07:00:00,1,2
2025-11-03T09:00:00,2,1
```

#### JSON Format

```json
{
  "journeys": [
    {
      "timestamp": "2025-11-03T07:00:00",
      "fromZone": 1,
      "toZone": 2
    }
  ]
}
```

## Example Files

The project includes these example files:

1. `example1-daily-cap.csv`: Demonstrates daily cap implementation
2. `example2-weekly-cap.csv`: Shows weekly cap implementation
3. `example3-zone2.json`: Examples of Zone 2 journeys in JSON format
4. `example3-edge-cases.json`: Tests various edge cases including DST transitions, leap year, and week/month boundaries

## Architecture and Flow

```
┌─────────────────┐     ┌───────────────────┐     ┌─────────────────┐
│   Input Files   │────▶│   JourneyParser   │────▶│ Journey Objects │
│  (CSV/JSON)     │     │                   │     │                 │
└─────────────────┘     └───────────────────┘     └────────┬────────┘
                                                           │
                                                           ▼
┌─────────────────┐     ┌───────────────────┐     ┌─────────────────┐
│   FareRules     │◀───▶│      Service      │◀────│   Strategies    │
│  Configuration  │     │   Orchestration    │     │  (Fare/Cap)     │
└─────────────────┘     └───────────────────┘     └─────────────────┘
                                  │
                                  ▼
┌─────────────────┐     ┌───────────────────┐
│    Output       │◀────│  Fare Calculation │
│   Formatting    │     │     Results       │
└─────────────────┘     └───────────────────┘
```

### Data Flow

1. **Input Processing**

   - Input files (CSV/JSON) are read
   - JourneyParser converts raw data into Journey objects
   - Each Journey contains timestamp and zone information

2. **Business Logic**

   - FareRules provide configuration for pricing and caps
   - Strategies implement specific calculation logic:
     - FareStrategy: Calculates base fares
     - CapStrategy: Applies daily and weekly caps

3. **Service Layer**

   - FareCalculationService orchestrates the process
   - Combines strategies to calculate final fares
   - Manages state for multi-journey calculations

4. **Output Generation**
   - Results are formatted for display
   - Includes journey details and fare breakdowns

### Key Components

1. **Domain Models**

   ```
   Journey ──────┐
        │       │
   FareRules    │
        │       │
   Results ◀────┘
   ```

2. **Strategy Pattern**

   ```
   ┌─────────────────┐
   │   Interface     │
   └────────┬────────┘
            │
    ┌───────┴───────┐
    │               │
   Fare          Cap
   Strategy    Strategy
   ```

3. **Service Layer**
   ```
   FareCalculationService
           │
    ┌──────┴───────┐
    │              │
   Fare          Cap
   Strategy    Strategy
   ```

## Project Structure

```
moystercard-fare-engine/
├── src/
│   ├── domain/           # Core domain models
│   ├── input/           # Input parsing logic
│   ├── output/          # Output formatting
│   ├── services/        # Business logic services
│   ├── strategies/      # Strategy pattern implementations
│   └── index.ts         # Application entry point
├── examples/           # Example input files
└── tests/             # Test files
```

## Testing

Run the test suite:

```bash
npm test
```

Run with coverage:

```bash
npm run test:coverage
```

## Design Patterns Used

- **Strategy Pattern**: For fare calculation and capping logic
- **Factory Pattern**: For creating fare accumulators
- **Single Responsibility Principle**: Each class has a single, well-defined purpose
- **Dependency Injection**: Services receive their dependencies through constructors

## Error Handling

The system handles various error cases:

- Invalid zone numbers (must be 1 or 2)
- Invalid date formats
- Malformed input files
- Missing required fields

## Future Improvements

- Support for more zones
- Real-time fare calculation API
- Integration with payment systems
- Support for different fare types (student, senior, etc.)
- Historical fare analysis and reporting
