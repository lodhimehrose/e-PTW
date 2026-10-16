import { addDays, format, isSameDay, parseISO } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { DUBAI_TZ } from "./constants";

export type HolidayEntry = { date: string; name?: string };

export function dubaiToday(): Date {
  return toZonedTime(new Date(), DUBAI_TZ);
}

export function isWeekendDay(date: Date, weekendDays: number[]): boolean {
  const day = date.getDay();
  return weekendDays.includes(day);
}

export function isHoliday(date: Date, holidays: HolidayEntry[]): boolean {
  const key = format(date, "yyyy-MM-dd");
  return holidays.some((h) => h.date === key);
}

export function isWorkingDay(
  date: Date,
  weekendDays: number[],
  holidays: HolidayEntry[],
): boolean {
  return !isWeekendDay(date, weekendDays) && !isHoliday(date, holidays);
}

export function addWorkingDays(
  start: Date,
  days: number,
  weekendDays: number[],
  holidays: HolidayEntry[],
): Date {
  let current = start;
  let added = 0;
  while (added < days) {
    current = addDays(current, 1);
    if (isWorkingDay(current, weekendDays, holidays)) {
      added += 1;
    }
  }
  return current;
}

export function parseDateOnly(value: string): Date {
  return parseISO(value);
}

export function datesEqualDay(a: Date, b: Date): boolean {
  return isSameDay(a, b);
}
