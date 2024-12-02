import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { Ticket } from "@/models"

export async function POST(req) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { ticketId } = await req.json()
        if (!ticketId) {
            await session.abortTransaction();
            session.endSession();
            return NextResponse.json(
                { message: "Ticket id can't be empty." },
                { status: 404 }
            );
        }

        const ticket = await Ticket.findOne({ ticketId });
        if (!ticket) {
            await session.abortTransaction();
            session.endSession();
            return NextResponse.json(
                { message: "Ticket not found." },
                { status: 404 }
            );
        }

        await session.commitTransaction()
        await session.endSession()
        return NextResponse.json(
            { message: "Ticket", ticket },
            { status: 200 }
        );

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error("Error in POST request:", error.message);
        return NextResponse.json(
            { message: "An error occurred", error: error.message },
            { status: 500 }
        );
    }
}
