import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const clearTrustedDevices = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const TrustedDevice = mongoose.model('TrustedDevice', new mongoose.Schema({}, { strict: false }));
    
    // Show all trusted devices
    const devices = await TrustedDevice.find({});
    console.log('\nFound trusted devices:', devices.length);
    devices.forEach(device => {
      console.log(`- Device: ${device.name || 'Unnamed'}, User: ${device.user}, Fingerprint: ${device.deviceFingerprint}`);
    });

    // Delete all
    const result = await TrustedDevice.deleteMany({});
    console.log(`\nDeleted ${result.deletedCount} trusted devices`);

    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

clearTrustedDevices();
