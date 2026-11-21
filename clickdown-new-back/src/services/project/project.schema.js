import { Schema, model } from 'mongoose';
import paginate from 'mongoose-paginate-v2';

const schema = new Schema({
  name: { type: String, required: true },
  icon: { type: String, default: 'images/project.svg' }, // default project icon
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  sprintLength: { type: Number, required: true },// length in days and all sprint will be created in this manner
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  tasks: [{ type: Schema.Types.ObjectId, ref: 'Task' }],
  bugs: [{ type: Schema.Types.ObjectId, ref: 'Task' }],
  sprints: [{ type: Schema.Types.ObjectId, ref: 'Sprint' }],
  favorit: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  chat: { type: Schema.Types.ObjectId, ref: 'Chat' },
  customFields: [{
    _id: false,
    show: { type: Schema.Types.Boolean, default: true },
    cf: { type: Schema.Types.ObjectId, ref: 'CustomField' }
  }],
  visibility: {
    type: String,
    default: 'show',
    enum: ['show', 'hide'],
  }
}, { timestamps: true });

schema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  return JSON.parse(JSON.stringify(obj).replace(/_id/g, 'id'));
};
// function recursivePopulate(path, levels) {
//   if (levels <= 0) {
//     return [];
//   }

//   return {
//     path,
//     strictPopulate: false,
//     select: 'name email username avatar customFields assignee endDate estimate priority type',
//     populate: recursivePopulate(path, levels - 1),
//   };
// }
// schema.pre(/^find/, function (next) {
//   this.populate({
//     path: 'sprints tasks bugs customFields members',
//     select: 'name email avatar type endDate  company role pinnedChats notifySubs setting createdAt',
//     strictPopulate: false,
//     populate: [
//       recursivePopulate('child assignee', 50),
//     ],
//   });
//   next();
// });
schema.plugin(paginate);

export default model('Project', schema);