/**
 * Seeds the roles and one demo account per role for local development.
 *
 *   npm run seed
 *
 * Safe to run more than once: existing roles and users are left untouched.
 * Never run this against a production database.
 */
import '../controllers/envController';
import mongoose from 'mongoose';
import Role from '../services/role/role.schema';
import User from '../services/user/user.schema';

// Keep this list in sync with DEMO_ACCOUNTS in clickdown-new-front/src/Features/Auth/Components/Login/demoAccounts.js
const ROLES = [
  { name: 'owner', department: 'management' },
  { name: 'admin', department: 'management' },
  { name: 'member', department: 'default' },
];

const DEMO_USERS = [
  { role: 'owner', name: 'Olivia Owner', username: 'owner', email: 'owner@workgrid.test', password: 'Owner@12345' },
  { role: 'admin', name: 'Adam Admin', username: 'admin', email: 'admin@workgrid.test', password: 'Admin@12345' },
  { role: 'member', name: 'Mia Member', username: 'member', email: 'member@workgrid.test', password: 'Member@12345' },
];

async function seed() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Refusing to seed demo data when NODE_ENV=production');
  }
  await mongoose.connect(process.env.MONGODB_URL);

  const roleIds = {};
  for (const role of ROLES) {
    const doc = await Role.findOneAndUpdate(
      { name: role.name },
      { $setOnInsert: role },
      { upsert: true, returnDocument: "after" },
    );
    roleIds[role.name] = doc._id.toString();
    console.log(`role  ${role.name.padEnd(7)} ${roleIds[role.name]}`);
  }

  if (process.env.DEFAULT_ROLE !== roleIds.member) {
    console.warn(`\nWARNING: DEFAULT_ROLE in .env should be ${roleIds.member} (the "member" role) so new sign-ups get the member role.\n`);
  }

  for (const demo of DEMO_USERS) {
    const exists = await User.exists({ email: demo.email });
    if (exists) {
      console.log(`skip  ${demo.email} (already exists)`);
      continue;
    }
    await User.create({
      name: demo.name,
      username: demo.username,
      email: demo.email,
      password: demo.password,
      role: roleIds[demo.role],
      company: 'Workgrid Demo',
    });
    console.log(`user  ${demo.email} (${demo.role})`);
  }

  console.log('\nDemo accounts ready. Password for each is shown on the sign-in page in development.');
  await mongoose.disconnect();
}

seed().catch(async (error) => {
  console.error('Seeding failed:', error.message);
  await mongoose.disconnect();
  process.exit(1);
});
