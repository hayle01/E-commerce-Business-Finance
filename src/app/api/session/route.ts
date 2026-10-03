import { requireUser } from "@/lib/api";
import { NextResponse } from "next/server";

export async function GET() {
  const { user, response } = await requireUser();
  if (response) return response;
  return NextResponse.json({ user });
}
