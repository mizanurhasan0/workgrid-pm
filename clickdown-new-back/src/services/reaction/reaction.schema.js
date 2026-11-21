import { Schema, model } from 'mongoose';

/**
 * A reaction records WHO reacted with which emoji on which message: one document per
 * (message, user, emoji). Message.reactions keeps referencing these documents by id.
 * `message` and `user` are optional so reactions created before they existed stay valid.
 */
const schema = new Schema({
  emoji: { type: String },
  name: { type: String },
  message: { type: Schema.Types.ObjectId, ref: 'Message' },
  user: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// One reaction per user, emoji and message. Legacy documents without message/user are not indexed.
schema.index(
  { message: 1, user: 1, emoji: 1 },
  { unique: true, partialFilterExpression: { message: { $exists: true }, user: { $exists: true } } },
);

schema.methods.toJSON = function () {
  return JSON.parse(JSON.stringify(this.toObject()).replace(/_id/g, 'id'));
};

export default model('Reaction', schema);
