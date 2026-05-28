import { DateTime } from 'luxon';
import type { PhtDateParts } from 'src/shared/@types/timezone';

export const PHT_ZONE = 'Asia/Manila';

export function parseIsoToUtcDate(input: string): Date | null {
  const parsed = DateTime.fromISO(input, { setZone: true });
  if (!parsed.isValid) {
    return null;
  }

  return parsed.toUTC().toJSDate();
}

export function getPhtPartsFromUtc(dateUtc: Date): PhtDateParts {
  const phtDate = DateTime.fromJSDate(dateUtc, { zone: 'utc' }).setZone(
    PHT_ZONE,
  );

  return {
    year: phtDate.year,
    month: phtDate.month,
    day: phtDate.day,
    hour: phtDate.hour,
    minute: phtDate.minute,
    second: phtDate.second,
    millisecond: phtDate.millisecond,
    dayOfWeekIndex: phtDate.weekday % 7,
  };
}

export function toUtcFromPhtParts(parts: Omit<PhtDateParts, 'dayOfWeekIndex'>) {
  const phtDate = DateTime.fromObject(
    {
      year: parts.year,
      month: parts.month,
      day: parts.day,
      hour: parts.hour,
      minute: parts.minute,
      second: parts.second,
      millisecond: parts.millisecond,
    },
    { zone: PHT_ZONE },
  );

  return phtDate.toUTC().toJSDate();
}

export function getPhtEpochMsFromUtc(dateUtc: Date): number {
  return DateTime.fromJSDate(dateUtc, { zone: 'utc' })
    .setZone(PHT_ZONE)
    .toMillis();
}

export function getNowPhtEpochMs(): number {
  return DateTime.now().setZone(PHT_ZONE).toMillis();
}
