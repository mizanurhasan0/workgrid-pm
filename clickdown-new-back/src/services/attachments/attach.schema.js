import { Schema, model } from 'mongoose';
import paginate from 'mongoose-paginate-v2';

const attachSchema = new Schema({
  chat: { type: Schema.Types.ObjectId, ref: 'Chat' },
  location: { type: String, required: true },
  type: { type: String, enum: ['file', 'image', 'Audio', 'Video'] }
}, { timestamps: true });

attachSchema.methods.toJSON = function () {
  return JSON.parse(JSON.stringify(this.toObject()).replace(/_id/g, 'id'));
};

attachSchema.plugin(paginate);
export default model('Attachment', attachSchema);