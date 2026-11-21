import { Schema, model } from 'mongoose';

const schema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  type: { type: String, required: true, enum: ['number', 'dropdown', 'string', 'date'] },
  value: { type: Schema.Types.Mixed },
  default: { type: Boolean, default: false },
}, { timestamps: true });

schema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  delete obj.createdAt;
  delete obj.updatedAt;
  return JSON.parse(JSON.stringify(obj).replace(/_id/g, 'id'));
};

export default model('CustomField', schema);