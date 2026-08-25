// Run with: npm run create-admin -- --name "Store Owner" --email owner@example.com --password YourStrongPass123
require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('../models/Admin');

function getArg(flag, fallback) {
  const idx = process.argv.indexOf(flag);
  return idx !== -1 ? process.argv[idx + 1] : fallback;
}

async function run() {
  const name = getArg('--name', 'Store Admin');
  const email = getArg('--email');
  const password = getArg('--password');

  if (!email || !password) {
    console.error('Usage: npm run create-admin -- --name "Name" --email you@example.com --password StrongPass123');
    process.exit(1);
  }
  if (password.length < 8) {
    console.error('Password must be at least 8 characters.');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);

  const existing = await Admin.findOne({ email: email.toLowerCase() });
  if (existing) {
    console.log('An admin with this email already exists.');
    process.exit(0);
  }

  const admin = await Admin.create({ name, email, password, role: 'superadmin' });
  console.log(`Admin created: ${admin.email}`);
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
