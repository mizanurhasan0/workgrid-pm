import { Schema, model } from 'mongoose';
import paginate from 'mongoose-paginate-v2';

const schema = new Schema({
  name: { type: String },
  icon: { type: String },
  creator: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  description: { type: String },
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  lastMessage: { type: Schema.Types.ObjectId, ref: 'Message' },
  offer: { type: Object },
  call: {
    onair: { type: Boolean, default: false },
    mode: { type: String, default: null, enum: ['audio', 'video', null] }
  },
  remove: { type: Boolean, default: false }
}, { timestamps: true, suppressReservedKeysWarning: true });

schema.methods.toJSON = function () {
  return JSON.parse(JSON.stringify(this.toObject()).replace(/_id/g, 'id'));
};

schema.plugin(paginate);
export default model('Chat', schema);