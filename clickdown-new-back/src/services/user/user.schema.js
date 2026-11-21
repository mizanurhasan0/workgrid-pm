import { Schema, model } from 'mongoose';
const jwt = require('jsonwebtoken');
const bCrypt = require('bcrypt');
const paginate = require('mongoose-paginate-v2');


const schema = new Schema({
  username: {
    type: String,
    trim: true,
  },
  name: {
    type: String,
    trim: true,
    required: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  avatar: {
    type: String,
    default: 'images/avatar.svg'
  },
  theme: {
    type: String
  },
  company: {
    type: String,
    default: 'Core Devs ltd.'
  },
  jobtitle: {
    type: String,
    trim: true,
  },
  department: {
    type: String,
    trim: true,
  },
  details: {
    type: String,
    trim: true,
  },
  role: {
    type: Schema.Types.ObjectId,
    ref: 'Role'
  },
  pinnedChats: [{
    type: Schema.Types.ObjectId,
    ref: 'Chat'
  }],
  notifySubs: [{
    type: Object
  }],
  settings: {
    mobileNotification: {
      type: Boolean,
      default: true
    },
    emailNotification: {
      type: Boolean,
      default: true
    },
    alwaysSendNotification: {
      type: Boolean,
      default: false
    }
  },
  refferer: {
    type: String,
    trim: true
  },
  push: {
    type: Object,
    default: {},
  }
}, { timestamps: true });

/* this method is used to generate web token to authenticate  */
schema.methods.generateToken = async function (expiresIn = '7d') {
  const token = jwt.sign({ id: this.id.toString() }, process.env.SECRET, { expiresIn });
  return token;
};

/* this pre method generates a hashed password for user password*/
schema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bCrypt.genSalt(10);
  this.password = await bCrypt.hash(this.password, salt);
});

/* this pre method compares password when someone wants to login using a user name and password*/
schema.methods.checkPassword = async function (submittedPass) {
  return await bCrypt.compare(submittedPass, this.password);
};
schema.plugin(paginate);
schema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();
  delete userObject.__v;
  delete userObject.createdAt;
  delete userObject.updatedAt;
  delete userObject.password;
  return JSON.parse(JSON.stringify(userObject).replace(/_id/g, 'id'));
};

export default model('User', schema);