import { DateTime } from "luxon";

export function useMidnight() {
  function getMidnight(date: Date): DateTime;
  function getMidnight(datetime: DateTime): DateTime;
  function getMidnight(datetimeOrDate: Date | DateTime): DateTime {
    if (datetimeOrDate instanceof Date) {
      return getMidnight(DateTime.fromJSDate(datetimeOrDate));
    }
    if (datetimeOrDate instanceof DateTime && datetimeOrDate.isValid) {
      return datetimeOrDate.plus({
        hour: -datetimeOrDate.hour,
        minute: -datetimeOrDate.minute,
        second: -datetimeOrDate.second,
        millisecond: -datetimeOrDate.millisecond,
      });
    }
    throw new Error("Must provide either a Date or DateTime");
  }
  return { getMidnight };
}
