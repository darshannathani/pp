import { Wallet, Transaction } from "@/models";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        // Fetch the wallet data
        const wallet = await Wallet.find({ userType: 'System' });

        // Fetch the transactions that have taskId (not null)
        const transactions = await Transaction.find({ taskId: { $ne: null } });

        // Return both wallet and transactions data as a JSON response
        return NextResponse.json({ wallet, transactions });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
