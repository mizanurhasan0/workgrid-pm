import { Schema, model } from 'mongoose';
import paginate from 'mongoose-paginate-v2';

const notifySchema = new Schema({
  typeField: String,
  area: String,
  message: String,
  preValue: { type: Object },
  curValue: { type: Object },
  comment: String,
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  task: { type: Schema.Types.ObjectId, ref: 'Task' },
  chat: { type: Schema.Types.ObjectId, ref: 'Chat' },
  attachment: String,
  action: String,
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

notifySchema.methods.toJSON = function () {
  return JSON.parse(JSON.stringify(this.toObject()).replace(/_id/g, 'id'));
};

notifySchema.plugin(paginate);
export default model('Notifications', notifySchema);