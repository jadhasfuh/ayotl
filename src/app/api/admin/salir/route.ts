import { NextResponse } from "next/server";
import { COOKIE_ADMIN, OPCIONES_COOKIE_ADMIN } from "@/lib/admin";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_ADMIN, "", { ...OPCIONES_COOKIE_ADMIN, maxAge: 0 });
  return res;
}
