import { parseISO } from "date-fns";

const getDateFromValue = (value: unknown): Date => {
  if (typeof value === "string") {
    return parseISO(value);
  } else if (typeof value === "number") {
    // to small to be ms, so its probably s
    if (value < 999999999999) {
      return new Date(value * 1000);
    } else {
      return new Date(value);
    }
  } else if (value instanceof Date) {
    return value;
  } else {
    throw new Error();
  }
};

export { getDateFromValue };
