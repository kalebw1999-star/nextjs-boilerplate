import { NextResponse } from "next/server";
import { destroySession } from "../../../../auth";

export async function POST() {
  try {
    await destroySession();
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Logout failed", error);
    return NextResponse.json(
      { error: "Unable to sign out right now." },
      { status: 500 }
    );
  }
}
