import { Schema, model } from 'mongoose';

/**
 * Per-user state of a notification (read / archived). A missing document means "unread, not archived".
 */
const schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  notification: { type: Schema.Types.ObjectId, ref: 'Notifications', required: true },
  read: { type: Boolean, default: false },
  archived: { type: Boolean, default: false },
  readAt: { type: Date },
  archivedAt: { type: Date },
}, { timestamps: true });

schema.index({ user: 1, notification: 1 }, { unique: true });

schema.methods.toJSON = function () {
  return JSON.parse(JSON.stringify(this.toObject()).replace(/_id/g, 'id'));
};

export default model('NotificationState', schema);
