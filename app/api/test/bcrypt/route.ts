import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { hash, password } = await request.json();

    if (!hash || !password) {
      return NextResponse.json({
        error: "Missing hash or password"
      }, { status: 400 });
    }

    const isValid = await bcrypt.compare(password, hash);

    return NextResponse.json({
      password,
      hash: hash.substring(0, 20) + "...",
      isValid,
      algorithm: hash.substring(0, 4)
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
