import mongoose from "mongoose";
import { Wallet, Transaction } from "@/models";

const SYSTEM_WALLET = process.env.SYSTEM_WALLET;

export async function createWallet(role, userId) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const wallet = new Wallet({
      role,
      userId,
      balance: 0,
    });

    await wallet.save({ session });
    await session.commitTransaction();
    console.log("Wallet created successfully");
  } catch (error) {
    await session.abortTransaction();
    console.error("Error creating wallet:", error);
    throw new Error("Failed to create wallet");
  } finally {
    session.endSession();
  }
}

export async function getWallet(userId) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const wallet = await Wallet.findOne({ user : userId }).session(session);
    await session.commitTransaction();
    return wallet;
  } catch (error) {
    await session.abortTransaction();
    console.error("Error getting wallet:", error);
    throw new Error("Failed to get wallet");
  } finally {
    session.endSession();
  }
}
const MAX_RETRIES = 3;

export async function debitWallet(userId, amount, taskId , session) {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const wallet = await Wallet.findOne({ user: userId }).session(session);

      if (!wallet) {
        await session.abortTransaction();
        throw new Error("Wallet not found");
      }

      if (wallet.balance < amount) {
        await session.abortTransaction();
        return {
          success: false,
          message: "Insufficient funds in wallet",
        };
      }

      // Deduct amount from user wallet
      wallet.balance -= amount;
      await wallet.save({ session });

      // Add amount to system wallet
      const systemWallet = await Wallet.findOneAndUpdate(
        { userType: "System" },
        { $inc: { balance: amount } },
        { new: true, session }
      );

      // Log the transaction
      const transaction = new Transaction({
        userId,
        direction: "debit",
        amount,
        taskId,
        status: "Completed",

      });
      await transaction.save({ session });

      return {
        success: true,
        message: "Wallet debited successfully",
        wallet,
        systemWallet,
      };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      console.error(`Error debiting wallet, attempt ${attempt + 1}:`, error);

      // Retry if it's a write conflict
      if (attempt < MAX_RETRIES - 1 && error.message.includes("write conflict")) {
        console.log("Retrying transaction...");
        continue;
      }
      
      throw new Error("Failed to debit wallet");
    }
  }
}

export async function creditWallet(userId, amount, taskId , session) {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const wallet = await Wallet.findOne({ user: userId }).session(session);

      if (!wallet) {
        await session.abortTransaction();
        throw new Error("Wallet not found");
      }

      // Check if the system wallet has sufficient balance to transfer
      const systemWallet = await Wallet.findOne({ _id: SYSTEM_WALLET }).session(session);

      // if (!systemWallet || systemWallet.balance < amount) {
      //   await session.abortTransaction();
      //   return {
      //     success: false,
      //     message: "System wallet has insufficient funds",
      //   };
      // }

      // // Deduct the amount from the system wallet
      // systemWallet.balance -= amount;
      // await systemWallet.save({ session });

      // Credit the amount to the user's wallet
      wallet.balance += amount;
      await wallet.save({ session });

      // Log the transaction
      const transaction = new Transaction({
        userId,
        direction: "credit",
        amount,
        taskId,
        status: "Completed",
      });
      await transaction.save({ session });

      return {
        success: true,
        message: "Wallet credited successfully",
        wallet,
        systemWallet,
      };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      console.error(`Error crediting wallet, attempt ${attempt + 1}:`, error);

      // Retry if it's a write conflict
      if (attempt < MAX_RETRIES - 1 && error.message.includes("write conflict")) {
        console.log("Retrying transaction...");
        continue;
      }

      throw new Error("Failed to credit wallet");
    }
  }
}

