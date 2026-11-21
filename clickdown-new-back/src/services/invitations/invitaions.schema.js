import { Schema, model } from 'mongoose';
const paginate = require('mongoose-paginate-v2');

const schema = new Schema({
  email: {
    type: String,
    required: true,
    trim: true,
  },
  access: {
    type: String,
    required: true,
    trim: true,
  },
  projects: [String],
  link: {
    type: String,
    required: true,
    trim: true,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted'],
    default: 'pending'
  }
}, { timestamps: true });

schema.plugin(paginate);
schema.methods.toJSON = function () {
  return JSON.parse(JSON.stringify(this.toObject()).replace(/_id/g, 'id'));
};

export default model('Invitations', schema);