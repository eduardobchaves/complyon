import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Registro público desabilitado. Solicite acesso ao administrador." },
    { status: 410 }
  );
}
