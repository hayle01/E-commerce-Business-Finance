import { describe, expect, it } from "vitest";
import { advanceDueDate } from "@/lib/services/recurring";

describe("advanceDueDate", () => {
  const base = new Date("2026-10-15T00:00:00Z");

  it("advances weekly by 7 days", () => {
    expect(advanceDueDate(base, "WEEKLY").toISOString().slice(0, 10)).toBe("2026-10-22");
  });

  it("advances monthly by roughly a month", () => {
    expect(advanceDueDate(base, "MONTHLY").toISOString().slice(0, 10)).toBe("2026-11-15");
  });

  it("advances yearly by roughly a year", () => {
    expect(advanceDueDate(base, "YEARLY").toISOString().slice(0, 10)).toBe("2027-10-15");
  });
});
