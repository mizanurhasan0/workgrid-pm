/**
 * Backfills the `message` reference of reactions created before reactions recorded who reacted.
 * Legacy reactions have no `user` (the author is unknown), so they stay as anonymous counts.
 *
 *   npm run migrate:reactions
 *
 * Idempotent.
 */
import '../controllers/envController';
import mongoose from 'mongoose';
import Message from '../services/message/message.schema';
import Reaction from '../services/reaction/reaction.schema';

async function migrate() {
  await mongoose.connect(process.env.MONGODB_URL);
  await Reaction.syncIndexes();
  let updated = 0;
  const cursor = Message.find({ 'reactions.0': { $exists: true } }).select('reactions').cursor();
  for await (const msg of cursor) {
    const { modifiedCount } = await Reaction.updateMany({ _id: { $in: msg.reactions }, message: { $exists: false } }, { $set: { message: msg._id } });
    updated += modifiedCount;
  }
  console.log(`Backfilled ${updated} reaction(s).`);
}

migrate()
  .catch((err) => {
    console.error('Reaction migration failed:', err.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
