"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Journey = void 0;
class Journey {
    timestamp;
    fromZone;
    toZone;
    constructor(timestamp, fromZone, toZone) {
        this.timestamp = timestamp;
        this.fromZone = fromZone;
        this.toZone = toZone;
        this.validateZones();
    }
    validateZones() {
        if (this.fromZone < 1 ||
            this.fromZone > 2 ||
            this.toZone < 1 ||
            this.toZone > 2) {
            throw new Error("Invalid zone. Zones must be either 1 or 2.");
        }
    }
    getZonePair() {
        // Sort zones to normalize the journey key (1-2 is same as 2-1)
        const [minZone, maxZone] = [this.fromZone, this.toZone].sort();
        return `${minZone}-${maxZone}`;
    }
    getWeekIdentifier() {
        const date = new Date(this.timestamp);
        date.setDate(date.getDate() - date.getDay() + 1); // Set to Monday
        date.setHours(0, 0, 0, 0);
        return date.toISOString().split("T")[0];
    }
    isPeakHour() {
        const hour = this.timestamp.getHours();
        const minutes = this.timestamp.getMinutes();
        const time = hour * 60 + minutes;
        const isWeekend = this.timestamp.getDay() === 0 || this.timestamp.getDay() === 6;
        if (isWeekend) {
            // Weekend peak hours: 9:00-11:00 and 18:00-22:00
            return (time >= 540 && time <= 660) || (time >= 1080 && time <= 1320);
        }
        else {
            // Weekday peak hours: 7:00-10:30 and 17:00-20:00
            return (time >= 420 && time <= 630) || (time >= 1020 && time <= 1200);
        }
    }
    getDate() {
        const date = new Date(this.timestamp);
        date.setHours(0, 0, 0, 0);
        return date;
    }
}
exports.Journey = Journey;
