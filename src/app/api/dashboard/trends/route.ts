import { requireUser } from "@/lib/api";
import { endOfDay, getTrends, startOfDay } from "@/lib/services/reporting";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { user, response } = await requireUser();
  if (response) return response;
  const from = startOfDay(new Date(request.nextUrl.searchParams.get("from") ?? new Date(0)));
  const to = endOfDay(new Date(request.nextUrl.searchParams.get("to") ?? new Date()));
  return NextResponse.json({ data: await getTrends(user!.id, { from, to }) });
}
