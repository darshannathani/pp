import { Creator } from "@/models";
import { NextResponse } from "next/server";
import { dbConnect } from "@/_lib/db";
dbConnect();

export async function GET() {
    const creators = await Creator.find();
    return NextResponse.json({ creators });
}
