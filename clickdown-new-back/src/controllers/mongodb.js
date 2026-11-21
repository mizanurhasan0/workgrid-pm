import mongoose from 'mongoose';

/**
 * Connects to MongoDB using MONGODB_URL. Resolves once connected, rejects on failure.
 */
export default async function connectMongoDB() {
  await mongoose.connect(process.env.MONGODB_URL, {
    serverSelectionTimeoutMS: 10000,
  });
  return 'Connected to MongoDB';
}
