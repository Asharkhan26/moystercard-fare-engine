export class Journey {
  constructor(
    public readonly timestamp: Date,
    public readonly fromZone: number,
    public readonly toZone: number
  ) {
    this.validateZones();
  }

  private validateZones(): void {
    if (
      this.fromZone < 1 ||
      this.fromZone > 2 ||
      this.toZone < 1 ||
      this.toZone > 2
    ) {
      throw new Error("Invalid zone. Zones must be either 1 or 2.");
    }
  }

  public getZonePair(): string {
    // Sort zones to normalize the journey key (1-2 is same as 2-1)
    const [minZone, maxZone] = [this.fromZone, this.toZone].sort();
    return `${minZone}-${maxZone}`;
  }

  public getWeekIdentifier(): string {
    const date = new Date(this.timestamp);
    // If it's Sunday (0), we need to go back 6 days to get to Monday
    // If it's any other day (1-6), we go back that many days minus 1
    const daysToMonday = date.getDay() === 0 ? 6 : date.getDay() - 1;
    date.setDate(date.getDate() - daysToMonday);
    date.setHours(0, 0, 0, 0);
    return date.toISOString().split("T")[0];
  }

  public isPeakHour(): boolean {
    const hour = this.timestamp.getHours();
    const minutes = this.timestamp.getMinutes();
    const time = hour * 60 + minutes;

    const isWeekend =
      this.timestamp.getDay() === 0 || this.timestamp.getDay() === 6;

    if (isWeekend) {
      // Weekend peak hours: 9:00-11:00 and 18:00-22:00
      return (time >= 540 && time <= 660) || (time >= 1080 && time <= 1320);
    } else {
      // Weekday peak hours: 7:00-10:30 and 17:00-20:00
      return (time >= 420 && time <= 630) || (time >= 1020 && time <= 1200);
    }
  }

  public getDate(): Date {
    const date = new Date(this.timestamp);
    date.setHours(0, 0, 0, 0);
    return date;
  }
}
