import { Ticket } from "@/models";
import { NextResponse } from "next/server";
import { dbConnect } from "@/_lib/db";

dbConnect();
export async function GET() {
    const tickets = await Ticket.find();
    return NextResponse.json({ tickets });
}
