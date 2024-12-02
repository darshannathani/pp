import { Tester } from "@/models";
import { NextResponse } from "next/server";
import { dbConnect } from "@/_lib/db";

dbConnect();

export async function GET() {
    const testers = await Tester.find();
    return NextResponse.json({ testers });
}