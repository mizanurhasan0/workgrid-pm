/**
 * Fixes the misspelled task priorities: "Immidate" -> "Immediate", "Tomorow" -> "Tomorrow".
 *
 *   npm run migrate:priority
 *
 * Idempotent: running it again changes nothing. The API accepts both spellings on input and
 * stores the correct one.
 */
import '../controllers/envController';
import mongoose from 'mongoose';
import Task from '../services/task/task.schema';
import { PRIORITY_ALIASES } from '../utils/priority';

async function migrate() {
  await mongoose.connect(process.env.MONGODB_URL);
  let total = 0;
  for (const [wrong, right] of Object.entries(PRIORITY_ALIASES)) {
    const { modifiedCount } = await Task.updateMany({ priority: wrong }, { $set: { priority: right } });
    console.log(`${wrong} -> ${right}: ${modifiedCount} task(s)`);
    total += modifiedCount;
  }
  console.log(total ? `Updated ${total} task(s).` : 'Nothing to migrate.');
}

migrate()
  .catch((err) => {
    console.error('Priority migration failed:', err.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
