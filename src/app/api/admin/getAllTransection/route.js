import { Transaction } from "@/models";
import { NextResponse } from "next/server";

export async function GET() {
    const transactions = await Transaction.find();
    return NextResponse.json({ transactions });
}