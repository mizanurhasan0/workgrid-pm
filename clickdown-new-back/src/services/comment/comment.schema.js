import { Schema, model } from 'mongoose';

const schema = new Schema({
  description: { type: String },
  author: { type: Schema.Types.ObjectId, ref: 'User' },
  task: { type: Schema.Types.ObjectId, ref: 'Task' },
  created: { type: Date }
}, { timestamps: true });

schema.methods.toJSON = function () {
  return JSON.parse(JSON.stringify(this.toObject()).replace(/_id/g, 'id'));
};

export default model('Comment', schema);