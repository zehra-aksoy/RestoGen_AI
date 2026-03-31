import calendarData from "../../data/institution-calendar.json";

export type CalendarPeriod = {
  id: string;
  label: string;
  start: string;
  end: string;
  prepMultiplier: number;
  note: string;
};

export type SpecialDay = {
  date: string;
  label: string;
  prepMultiplier: number;
  note: string;
};

export type InstitutionCalendar = {
  timezone?: string;
  periods: CalendarPeriod[];
  specialDays: SpecialDay[];
  closedDays: string[];
};

const data = calendarData as InstitutionCalendar;

export function getInstitutionCalendar(): InstitutionCalendar {
  return data;
}

function parseISODate(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function isBetween(d: Date, start: string, end: string): boolean {
  const t = d.setHours(12, 0, 0, 0);
  const a = parseISODate(start).getTime();
  const b = parseISODate(end).getTime();
  return t >= a && t <= b;
}

export function getActiveCalendarContext(date = new Date()): {
  period: CalendarPeriod | null;
  specialDay: SpecialDay | null;
  closed: boolean;
} {
  const iso = date.toISOString().slice(0, 10);
  const closed = data.closedDays.includes(iso);
  const specialDay =
    data.specialDays.find((s) => s.date === iso) ?? null;
  const period =
    data.periods.find((p) => isBetween(new Date(date), p.start, p.end)) ??
    null;
  return { period, specialDay, closed };
}
