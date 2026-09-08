require('dotenv').config();
const mongoose = require('mongoose');
const ServicePartner = require('./models/ServicePartner');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const email = process.env.DEMO_PARTNER_EMAIL || 'prashantupadhyay70071@gmail.com';
  
  let partner = await ServicePartner.findOne({ email: email.toLowerCase() });
  if (!partner) {
    partner = new ServicePartner({
      name: 'Prashant Upadhyay (Demo)',
      email: email.toLowerCase(),
      phone: '9999999999',
      dob: new Date('1990-01-01'),
      gender: 'Male',
      category: 'ac-appliance-repair',
      kycStatus: 'APPROVED',
      isActive: true,
      password: 'password123',
    });
    await partner.save();
    console.log('Demo partner created successfully.');
  } else {
    partner.kycStatus = 'APPROVED';
    partner.isActive = true;
    await partner.save();
    console.log('Demo partner already exists, updated to APPROVED.');
  }
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
