import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/user.model.js';

dotenv.config();

const email = String(process.argv[2] || '').trim();
if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  console.error('Usage: npm run set-admin -- user@example.com');
  process.exit(1);
}

try {
  if (!process.env.MONGO) throw new Error('MONGO is not configured in .env');
  await mongoose.connect(process.env.MONGO);
  const escapedEmail = email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const user = await User.findOneAndUpdate(
    { email: { $regex: `^${escapedEmail}$`, $options: 'i' } },
    { $set: { isAdmin: true } },
    { new: true }
  ).select('email isAdmin');

  if (!user) {
    console.error(`No account found for ${email}. Create that account first, then run this command again.`);
    process.exitCode = 1;
  } else {
    console.log(`Admin access enabled for ${user.email}. Sign out and sign back in to see Dashboard.`);
  }
} catch (error) {
  console.error(`Could not update admin access: ${error.message}`);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
