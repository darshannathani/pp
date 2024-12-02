import { creditWallet } from "@/_lib/walletService";
import { NextResponse } from "next/server";
import { Transaction , Wallet } from "@/models";
import mongoose from "mongoose";

export async function POST(req) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { amount, userId } = await req.json();
        const wallet = await Wallet.findOne({ user:userId }).session(session);

        if (!wallet) {
            await session.abortTransaction();
            return NextResponse.json(
                { message: "Wallet not found" },
                { status: 404 }
            );
        }

        // Credit the amount to the user's wallet
      wallet.balance -= amount;
      await wallet.save({ session });

      // Log the transaction
      const transaction = new Transaction({
        userId,
        direction: "debit",
        amount,
        status: "Completed",
      });+
      await transaction.save({ session });

      await session.commitTransaction();
      session.endSession();

        return NextResponse.json(
            { message: "Amount added successfully" },
            { status: 201 }
        );

    } catch (error) {

        await session.abortTransaction();
        session.endSession();
        console.error("Error:", error.message);
        return NextResponse.json(
            { message: "An error occurred", error: error.message },
            { status: 500 }
        );
        
    }
}