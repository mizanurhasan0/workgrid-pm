import { Schema, model } from 'mongoose';
import paginate from 'mongoose-paginate-v2';

const schema = new Schema({
  author: { type: Schema.Types.ObjectId, ref: 'User' },
  message: { type: String },
  reactions: [{ type: Schema.Types.ObjectId, ref: 'Reaction' }],
  chat: { type: Schema.Types.ObjectId, ref: 'Chat' },
  type: { type: String },
  created: { type: Date, default: new Date().toISOString() },
  seen: { type: Boolean, default: false },
  attachments: [{
    type: Schema.Types.ObjectId,
    ref: 'Attachment',
    default: [],
  }],
  deleted: { type: Boolean },
  read_by: [{ type: Schema.Types.ObjectId, ref: 'User', default: [] }],
}, { timestamps: true });

schema.methods.toJSON = function () {
  return JSON.parse(JSON.stringify(this.toObject()).replace(/_id/g, 'id'));
};

schema.plugin(paginate);
export default model('Message', schema);