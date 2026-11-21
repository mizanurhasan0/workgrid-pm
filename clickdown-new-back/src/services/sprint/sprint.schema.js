import { Schema, model } from 'mongoose';
import paginate from 'mongoose-paginate-v2';

const schema = new Schema({
  status: { type: String, enum: ['done', 'onGoing'], default: 'onGoing' },
  startDate: { type: Date, required: true, default: new Date().toISOString() },
  endDate: { type: Date, required: true },
  tasks: [{ type: Schema.Types.ObjectId, ref: 'Task' }],
  title: { type: String, default: 'Sprint' }
}, { timestamps: true });

schema.methods.toJSON = function () {
  return JSON.parse(JSON.stringify(this.toObject()).replace(/_id/g, 'id'));
};

schema.plugin(paginate);

export default model('Sprint', schema);