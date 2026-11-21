import { Schema, model } from 'mongoose';
const paginate = require('mongoose-paginate-v2');

const schema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  department: {
    type: String,
    trim: true,
    required: true,
  }
}, { timestamps: true });

schema.plugin(paginate);

schema.methods.toJSON = function () {
  return JSON.parse(JSON.stringify(this.toObject()).replace(/_id/g, 'id'));
};

export default model('Role', schema);