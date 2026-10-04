import { describe, expect, it } from "vitest";
import { formatMoney } from "@/lib/format";
import { fromCents, toCents } from "@/lib/money";

describe("money helpers", () => {
  it("converts dollars to cents exactly", () => {
    expect(toCents("12.34")).toBe(1234);
    expect(toCents(0)).toBe(0);
    expect(toCents("0.01")).toBe(1);
  });

  it("converts cents back to a fixed-2 string", () => {
    expect(fromCents(1234)).toBe("12.34");
    expect(fromCents(5)).toBe("0.05");
    expect(fromCents(0)).toBe("0.00");
  });

  it("does not lose cents on line totals", () => {
    // 19.99 x 3 must equal 59.97, not 59.96 or 59.969999
    const total = toCents("19.99") * 3;
    expect(fromCents(total)).toBe("59.97");
  });

  it("rejects non-finite values", () => {
    expect(() => toCents("not-a-number")).toThrow();
    expect(() => toCents(Number.NaN)).toThrow();
  });
});

describe("formatMoney", () => {
  it("formats USD", () => {
    expect(formatMoney(1234.5)).toBe("$1,234.50");
  });
});
