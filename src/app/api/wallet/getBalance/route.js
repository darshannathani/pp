import { getWallet } from "@/_lib/walletService";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const reqBody = await req.json();
        if (!reqBody) {
            return NextResponse.json({ message: "Body should not be empty" }, { status: 400 });
        }

        const { userId } = reqBody;

        if (!userId) {
            return NextResponse.json({ message: "UserId is required" }, { status: 400 });
        }

        const wallet = await getWallet(userId);
        console.log(wallet);

        return NextResponse.json({ wallet }, { status: 200 });

    } catch (e) {
        console.log(e);
    }
}