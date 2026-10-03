import { requireUser } from "@/lib/api";
import { endOfDay, getFinancialSummary, getReportBreakdowns, startOfDay } from "@/lib/services/reporting";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { response } = await requireUser();
  if (response) return response;
  const from = startOfDay(new Date(request.nextUrl.searchParams.get("from") ?? new Date(0)));
  const to = endOfDay(new Date(request.nextUrl.searchParams.get("to") ?? new Date()));
  const [summary, breakdowns] = await Promise.all([
    getFinancialSummary({ from, to }),
    getReportBreakdowns({ from, to }),
  ]);
  return NextResponse.json({ data: { summary, breakdowns } });
}
