import bcryptjs from 'bcryptjs';
import User from '../models/user.model.js';

export const isConfiguredAdminEmail = (email) => {
  const configuredEmail = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  return Boolean(configuredEmail && String(email || '').trim().toLowerCase() === configuredEmail);
};

export const ensureConfiguredAdminAccount = async () => {
  const email = String(process.env.ADMIN_EMAIL || '').trim();
  const password = String(process.env.ADMIN_PASSWORD || '');
  if (!email || !password) return;

  const escapedEmail = email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  let user = await User.findOne({ email: { $regex: `^${escapedEmail}$`, $options: 'i' } });
  if (!user) {
    user = new User({ email, password: bcryptjs.hashSync(password, 12), isAdmin: true });
    await user.save();
    console.log(`Configured admin account created for ${email}.`);
    return;
  }

  if (!user.isAdmin || !bcryptjs.compareSync(password, user.password)) {
    user.isAdmin = true;
    user.password = bcryptjs.hashSync(password, 12);
    await user.save();
    console.log(`Configured admin access updated for ${user.email}.`);
  }
};

export const promoteConfiguredAdmin = async (user) => {
  if (user && isConfiguredAdminEmail(user.email) && !user.isAdmin) {
    user.isAdmin = true;
    await user.save();
  }
  return user;
};
