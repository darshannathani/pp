import mongoose from 'mongoose';
import { Tester, Creator, Admin , Wallet} from '@/models';


// Function to create wallets for existing users
const createWalletsForExistingUsers = async () => {
  try {
    // Step 1: Fetch all testers, creators, and admins
    const testers = await Tester.find({});
    const creators = await Creator.find({});
    const admins = await Admin.find({});

    // Step 2: Create wallets for testers
    for (const tester of testers) {
      const existingWallet = await Wallet.findOne({ user: tester._id, userType: 'Tester' });
      if (!existingWallet) {
        await Wallet.create({
          userType: 'Tester',
          user: tester._id,
          balance: 0,
        });
        console.log(`Created wallet for tester: ${tester._id}`);
      }
    }

    // Step 3: Create wallets for creators
    for (const creator of creators) {
      const existingWallet = await Wallet.findOne({ user: creator._id, userType: 'Creator' });
      if (!existingWallet) {
        await Wallet.create({
          userType: 'Creator',
          user: creator._id,
          balance: 0,
        });
        console.log(`Created wallet for creator: ${creator._id}`);
      }
    }

    // Step 4: Create wallets for admins
    for (const admin of admins) {
      const existingWallet = await Wallet.findOne({ user: admin._id, userType: 'Admin' });
      if (!existingWallet) {
        await Wallet.create({
          userType: 'Admin',
          user: admin._id,
          balance: 0,
        });
        console.log(`Created wallet for admin: ${admin._id}`);
      }
    }

    console.log('Wallet creation for existing users completed successfully!');
  } catch (error) {
    console.error('Error creating wallets for existing users:', error);
  } finally {
    mongoose.connection.close(); // Close the connection when done
  }
};

// Run the migration script
const runMigration = async () => {
  await createWalletsForExistingUsers();
};

export {runMigration};
