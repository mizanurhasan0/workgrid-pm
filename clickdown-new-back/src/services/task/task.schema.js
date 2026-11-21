import { Schema, model } from 'mongoose';
import paginate from 'mongoose-paginate-v2';

const schema = new Schema({
  project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  name: { type: String, required: true },
  description: { type: String },
  type: { type: String }, /* , enum: ['bug', 'feat', 'inhancement', 'dev'] */
  startDate: { type: Date },
  endDate: { type: Date },
  assignee: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  estimate: { type: String },
  points: { type: Number },
  elapsedtime: { type: Number, default: 0 },
  pause: { type: Boolean, default: false },
  startTime: { type: Number, default: 0 },
  priority: { type: String },
  child: [{ type: Schema.Types.ObjectId, ref: 'Task' }],
  remove: {
    type: Boolean,
    default: false,
  },
  logs: [{
    type: Schema.Types.ObjectId,
    ref: 'Notifications',
  }],
  customFields: [
    {
      _id: false,
      cf: { type: Schema.Types.ObjectId, ref: 'CustomField', required: true },
      value: { type: Schema.Types.Mixed, required: true }
    }
  ]
}, { timestamps: true, suppressReservedKeysWarning: true });

schema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  return JSON.parse(JSON.stringify(obj).replace(/_id/g, 'id'));
};

schema.plugin(paginate);
export default model('Task', schema);